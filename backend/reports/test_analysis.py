
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from rest_framework import status
from rest_framework.test import APITestCase

from .models import MedicalMeasurement, MedicalReport


User = get_user_model()


class MedicalReportAnalysisAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="analysis_user",
            password="TestPassword123!",
        )

        self.client.force_authenticate(user=self.user)

        self.report = self.create_report(self.user)

        self.analyze_url = reverse(
            "medical-record-analyze",
            args=[self.report.pk],
        )

        self.extraction_result = {
            "text": (
                "[Page 1]\n"
                "Haemoglobin 12.5 g/dL 12.0 - 15.5"
            ),
            "page_count": 1,
            "extraction_method": "pymupdf_text",
            "measurement_count": 1,
            "warnings": [],
            "measurements": [
                {
                    "analyte_name": "Haemoglobin",
                    "normalized_name": "haemoglobin",
                    "value": Decimal("12.5"),
                    "qualitative_value": "",
                    "unit": "g/dL",
                    "reference_range_text": "12.0 - 15.5",
                    "reference_min": Decimal("12.0"),
                    "reference_max": Decimal("15.5"),
                    "status": "normal",
                    "source_text": "Haemoglobin 12.5 g/dL",
                    "confidence": None,
                    "page_number": 1,
                }
            ],
        }

    def create_report(self, user):
        uploaded_file = SimpleUploadedFile(
            "analysis-test.pdf",
            b"%PDF-1.4\nTest report content",
            content_type="application/pdf",
        )

        return MedicalReport.objects.create(
            user=user,
            title="Analysis Test",
            category=MedicalReport.Category.BLOOD_TEST,
            original_filename="analysis-test.pdf",
            file=uploaded_file,
            file_size=uploaded_file.size,
        )

    def tearDown(self):
        for report in MedicalReport.objects.filter(
            title="Analysis Test"
        ):
            report.delete()

        super().tearDown()

    @patch("reports.views.extract_pdf_report")
    def test_user_can_analyze_own_report(self, mock_extract):
        mock_extract.return_value = self.extraction_result

        response = self.client.post(self.analyze_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["processing_status"], "completed")
        self.assertEqual(response.data["measurement_count"], 1)

        self.assertEqual(
            response.data["measurements"][0]["analyte_name"],
            "Haemoglobin",
        )

        self.report.refresh_from_db()

        self.assertTrue(self.report.extracted_text)
        self.assertEqual(
            self.report.extraction_method,
            "pymupdf_text",
        )

        self.assertEqual(
            self.report.measurements.count(),
            1,
        )

        mock_extract.assert_called_once()

    @patch("reports.views.extract_pdf_report")
    def test_user_cannot_analyze_another_users_report(
        self,
        mock_extract,
    ):
        another_user = User.objects.create_user(
            username="another_analysis_user",
            password="TestPassword123!",
        )

        another_report = self.create_report(another_user)

        url = reverse(
            "medical-record-analyze",
            args=[another_report.pk],
        )

        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        mock_extract.assert_not_called()

    @patch("reports.views.extract_pdf_report")
    def test_failed_persistence_preserves_existing_measurements(
        self,
        mock_extract,
    ):
        mock_extract.return_value = self.extraction_result

        existing_measurement = MedicalMeasurement.objects.create(
            report=self.report,
            analyte_name="Existing result",
            normalized_name="existing_result",
            value=Decimal("10.0"),
            unit="mg/dL",
            status=MedicalMeasurement.ResultStatus.NORMAL,
        )

        with patch(
            "reports.views.MedicalMeasurement.objects.bulk_create",
            side_effect=RuntimeError("Simulated database failure"),
        ):
            response = self.client.post(self.analyze_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

        self.assertTrue(
            MedicalMeasurement.objects.filter(
                pk=existing_measurement.pk
            ).exists()
        )

        self.report.refresh_from_db()

        self.assertEqual(
            self.report.processing_status,
            MedicalReport.ProcessingStatus.FAILED,
        )
