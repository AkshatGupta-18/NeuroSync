import logging
from decimal import Decimal, InvalidOperation
from pathlib import Path

from django.db import transaction
from django.http import FileResponse
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MedicalMeasurement, MedicalReport
from .pdf_extraction import PDFExtractionError, extract_pdf_report
from .serializers import (
    MedicalMeasurementSerializer,
    MedicalReportSerializer,
)


logger = logging.getLogger(__name__)


CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
}

DECIMAL_QUANTUM = Decimal("0.0001")
MAX_DECIMAL_VALUE = Decimal("10000000000")


def _database_decimal(value):
    if value is None:
        return None

    try:
        converted = Decimal(value).quantize(DECIMAL_QUANTUM)

        if abs(converted) >= MAX_DECIMAL_VALUE:
            return None

        return converted

    except (InvalidOperation, TypeError, ValueError):
        return None


def _build_measurement(report, extracted):
    return MedicalMeasurement(
        report=report,
        analyte_name=extracted["analyte_name"],
        normalized_name=extracted["normalized_name"],
        value=_database_decimal(extracted["value"]),
        qualitative_value=extracted["qualitative_value"],
        unit=extracted["unit"],
        reference_range_text=extracted["reference_range_text"],
        reference_min=_database_decimal(extracted["reference_min"]),
        reference_max=_database_decimal(extracted["reference_max"]),
        status=extracted["status"],
        source_text=extracted["source_text"],
        confidence=_database_decimal(extracted["confidence"]),
        page_number=extracted["page_number"],
        verification_status=(
            MedicalMeasurement.VerificationStatus.MACHINE_EXTRACTED
        ),
    )


class MedicalReportViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            MedicalReport.objects.filter(user=self.request.user)
            .prefetch_related("measurements")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def _file_response(self, report, as_attachment):
        extension = Path(report.original_filename).suffix.lower()
        content_type = CONTENT_TYPES.get(
            extension,
            "application/octet-stream",
        )

        response = FileResponse(
            report.file.open("rb"),
            as_attachment=as_attachment,
            filename=report.original_filename,
            content_type=content_type,
        )

        response["X-Content-Type-Options"] = "nosniff"
        response["Cache-Control"] = "private, no-store"

        if not as_attachment:
            response["Content-Security-Policy"] = (
                "default-src 'none'; sandbox"
            )

        return response

    @action(detail=True, methods=["get"])
    def download(self, request, pk=None):
        report = self.get_object()
        return self._file_response(report, as_attachment=True)

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        report = self.get_object()
        return self._file_response(report, as_attachment=False)

    @action(detail=True, methods=["post"])
    def analyze(self, request, pk=None):
        report = self.get_object()

        extension = Path(report.original_filename).suffix.lower()

        if extension != ".pdf":
            report.processing_status = MedicalReport.ProcessingStatus.FAILED
            report.processing_error = (
                "Automatic extraction currently supports text-based "
                "PDF files only. Image OCR is not enabled yet."
            )
            report.processed_at = timezone.now()
            report.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "processed_at",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail": report.processing_error,
                    "processing_status": report.processing_status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        report.processing_status = MedicalReport.ProcessingStatus.PROCESSING
        report.processing_error = ""
        report.save(
            update_fields=[
                "processing_status",
                "processing_error",
                "updated_at",
            ]
        )

        try:
            with report.file.open("rb") as file_object:
                extraction = extract_pdf_report(file_object)

        except PDFExtractionError as exc:
            report.processing_status = MedicalReport.ProcessingStatus.FAILED
            report.processing_error = str(exc)[:500]
            report.processed_at = timezone.now()
            report.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "processed_at",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail": report.processing_error,
                    "processing_status": report.processing_status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception:
            logger.exception(
                "Unexpected medical report processing failure. "
                "Report ID: %s",
                report.pk,
            )

            report.processing_status = MedicalReport.ProcessingStatus.FAILED
            report.processing_error = (
                "An unexpected error occurred while processing this report."
            )
            report.processed_at = timezone.now()
            report.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "processed_at",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail": report.processing_error,
                    "processing_status": report.processing_status,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        measurements = []
        skipped_measurements = 0

        for extracted in extraction["measurements"]:
            measurement = _build_measurement(report, extracted)

            if (
                extracted["value"] is not None
                and measurement.value is None
            ):
                skipped_measurements += 1
                continue

            measurements.append(measurement)

        warnings = list(extraction["warnings"])

        if skipped_measurements:
            warnings.append(
                f"{skipped_measurements} extracted result(s) exceeded "
                "supported numeric precision and require manual review."
            )

        try:
            with transaction.atomic():
                locked_report = MedicalReport.objects.select_for_update().get(
                    pk=report.pk,
                    user=request.user,
                )

                locked_report.measurements.all().delete()

                MedicalMeasurement.objects.bulk_create(measurements)

                locked_report.extracted_text = extraction["text"]
                locked_report.extraction_method = extraction[
                    "extraction_method"
                ]
                locked_report.processing_status = (
                    MedicalReport.ProcessingStatus.COMPLETED
                )
                locked_report.processing_error = ""
                locked_report.processed_at = timezone.now()

                locked_report.save(
                    update_fields=[
                        "extracted_text",
                        "extraction_method",
                        "processing_status",
                        "processing_error",
                        "processed_at",
                        "updated_at",
                    ]
                )

        except Exception:
            logger.exception(
                "Failed to persist extracted medical measurements. "
                "Report ID: %s",
                report.pk,
            )

            report.refresh_from_db()
            report.processing_status = MedicalReport.ProcessingStatus.FAILED
            report.processing_error = (
                "The extracted results could not be saved. "
                "Please try processing the report again."
            )
            report.processed_at = timezone.now()
            report.save(
                update_fields=[
                    "processing_status",
                    "processing_error",
                    "processed_at",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "detail": report.processing_error,
                    "processing_status": report.processing_status,
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        saved_measurements = locked_report.measurements.all()

        return Response(
            {
                "report_id": locked_report.pk,
                "processing_status": locked_report.processing_status,
                "extraction_method": locked_report.extraction_method,
                "measurement_count": saved_measurements.count(),
                "warnings": warnings,
                "measurements": MedicalMeasurementSerializer(
                    saved_measurements,
                    many=True,
                ).data,
            },
            status=status.HTTP_200_OK,
        )