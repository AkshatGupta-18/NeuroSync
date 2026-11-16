
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from .models import MedicalReport
from .serializers import MAX_REPORT_SIZE


User = get_user_model()


class MedicalReportAPITests(APITestCase):
    list_url = "/api/reports/medical-records/"

    def setUp(self):
        self.user = User.objects.create_user(
            username="report_owner",
            password="TestPassword123!",
        )

        self.other_user = User.objects.create_user(
            username="another_user",
            password="TestPassword123!",
        )

        self.client.force_authenticate(user=self.user)

    def tearDown(self):
        # Remove stored test files before the test database is flushed.
        for report in MedicalReport.objects.all():
            if report.file:
                report.file.delete(save=False)

        super().tearDown()

    def make_pdf(self, name="blood-report.pdf", content=None):
        if content is None:
            content = b"%PDF-1.4\nTest medical report\n"

        return SimpleUploadedFile(
            name,
            content,
            content_type="application/pdf",
        )

    def upload_report(self, uploaded_file=None):
        if uploaded_file is None:
            uploaded_file = self.make_pdf()

        return self.client.post(
            self.list_url,
            {
                "title": "Blood Test Report",
                "category": "blood_test",
                "file": uploaded_file,
            },
            format="multipart",
        )

    def test_unauthenticated_user_cannot_list_reports(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_upload_report(self):
        response = self.upload_report()

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(MedicalReport.objects.count(), 1)

        report = MedicalReport.objects.get()

        self.assertEqual(report.user, self.user)
        self.assertEqual(report.category, "blood_test")
        self.assertEqual(report.file_size, len(
            b"%PDF-1.4\nTest medical report\n"
        ))

        # API responses must not expose internal storage paths or URLs.
        self.assertNotIn("file", response.data)
        self.assertNotIn("file_url", response.data)

        self.assertTrue(report.file.storage.exists(report.file.name))

        media_root = Path(settings.MEDIA_ROOT).resolve()
        stored_path = Path(report.file.path).resolve()

        self.assertNotEqual(stored_path, media_root)
        self.assertNotIn(media_root, stored_path.parents)

    def test_user_can_list_only_own_reports(self):
        self.upload_report()

        other_report = MedicalReport.objects.create(
            user=self.other_user,
            title="Private Report",
            category="blood_test",
            original_filename="private.pdf",
            file=self.make_pdf("private.pdf"),
            file_size=len(b"%PDF-1.4\nTest medical report\n"),
        )

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.user.medical_reports.first().id)

        other_report.file.delete(save=False)

    def test_user_cannot_access_another_users_report(self):
        other_report = MedicalReport.objects.create(
            user=self.other_user,
            title="Private Report",
            category="blood_test",
            original_filename="private.pdf",
            file=self.make_pdf("private.pdf"),
            file_size=len(b"%PDF-1.4\nTest medical report\n"),
        )

        detail_url = f"{self.list_url}{other_report.id}/"

        response = self.client.get(detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        response = self.client.get(f"{detail_url}download/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        response = self.client.get(f"{detail_url}preview/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        response = self.client.delete(detail_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            MedicalReport.objects.filter(pk=other_report.pk).exists()
        )

        other_report.file.delete(save=False)

    def test_user_can_download_own_report(self):
        upload_response = self.upload_report()

        report_id = upload_response.data["id"]

        response = self.client.get(
            f"{self.list_url}{report_id}/download/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response["X-Content-Type-Options"],
            "nosniff",
        )
        self.assertIn(
            "attachment",
            response["Content-Disposition"],
        )

        downloaded_content = b"".join(response.streaming_content)

        self.assertTrue(downloaded_content.startswith(b"%PDF-"))

    def test_user_can_preview_own_report(self):
        upload_response = self.upload_report()

        report_id = upload_response.data["id"]

        response = self.client.get(
            f"{self.list_url}{report_id}/preview/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response["X-Content-Type-Options"],
            "nosniff",
        )
        self.assertIn(
            "sandbox",
            response["Content-Security-Policy"],
        )

        preview_content = b"".join(response.streaming_content)

        self.assertTrue(preview_content.startswith(b"%PDF-"))

    def test_user_can_delete_own_report(self):
        upload_response = self.upload_report()

        report_id = upload_response.data["id"]

        report = MedicalReport.objects.get(pk=report_id)
        stored_name = report.file.name
        storage = report.file.storage

        response = self.client.delete(
            f"{self.list_url}{report_id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            MedicalReport.objects.filter(pk=report_id).exists()
        )

        self.assertFalse(storage.exists(stored_name))

    def test_upload_rejects_unsupported_extension(self):
        uploaded_file = SimpleUploadedFile(
            "report.exe",
            b"%PDF-1.4\nNot an allowed extension",
        )

        response = self.upload_report(uploaded_file)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(MedicalReport.objects.count(), 0)

    def test_upload_rejects_mismatched_file_signature(self):
        uploaded_file = SimpleUploadedFile(
            "report.pdf",
            b"This is not a PDF file",
        )

        response = self.upload_report(uploaded_file)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(MedicalReport.objects.count(), 0)

    def test_upload_rejects_files_over_size_limit(self):
        content = b"%PDF-" + (
            b"A" * (MAX_REPORT_SIZE + 1)
        )

        uploaded_file = SimpleUploadedFile(
            "large-report.pdf",
            content,
        )

        response = self.upload_report(uploaded_file)

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertEqual(MedicalReport.objects.count(), 0)
