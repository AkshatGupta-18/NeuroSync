
import re
from pathlib import Path

from rest_framework import serializers

from .models import MedicalMeasurement, MedicalReport


MAX_REPORT_SIZE = 15 * 1024 * 1024

ALLOWED_SIGNATURES = {
    ".pdf": lambda data: data.startswith(b"%PDF-"),
    ".jpg": lambda data: data.startswith(b"\xff\xd8\xff"),
    ".jpeg": lambda data: data.startswith(b"\xff\xd8\xff"),
    ".png": lambda data: data.startswith(
        b"\x89PNG\r\n\x1a\n"
    ),
}


def safe_original_filename(filename):
    filename = str(filename).replace("\\", "/").split("/")[-1]
    filename = re.sub(r"[\x00-\x1f\x7f]", "", filename)
    return filename[:255] or "medical-report"


class MedicalMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalMeasurement
        fields = [
            "id",
            "analyte_name",
            "normalized_name",
            "value",
            "qualitative_value",
            "unit",
            "reference_range_text",
            "reference_min",
            "reference_max",
            "status",
            "source_text",
            "confidence",
            "page_number",
            "verification_status",
        ]
        read_only_fields = fields


class MedicalReportSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    measurements = MedicalMeasurementSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = MedicalReport
        fields = [
            "id",
            "title",
            "category",
            "original_filename",
            "file",
            "file_size",
            "report_date",
            "processing_status",
            "created_at",
            "updated_at",
            "measurements",
        ]
        read_only_fields = [
            "id",
            "original_filename",
            "file_size",
            "processing_status",
            "created_at",
            "updated_at",
            "measurements",
        ]
        extra_kwargs = {
            "title": {"required": False},
        }

    def validate_file(self, uploaded_file):
        if uploaded_file.size <= 0:
            raise serializers.ValidationError(
                "The uploaded file is empty."
            )

        if uploaded_file.size > MAX_REPORT_SIZE:
            raise serializers.ValidationError(
                "File size must not exceed 15 MB."
            )

        filename = safe_original_filename(uploaded_file.name)
        extension = Path(filename).suffix.lower()

        signature_validator = ALLOWED_SIGNATURES.get(extension)

        if signature_validator is None:
            raise serializers.ValidationError(
                "Only PDF, JPG, JPEG and PNG files are supported."
            )

        uploaded_file.seek(0)
        signature = uploaded_file.read(16)
        uploaded_file.seek(0)

        if not signature_validator(signature):
            raise serializers.ValidationError(
                "The file content does not match its extension."
            )

        return uploaded_file

    def create(self, validated_data):
        uploaded_file = validated_data["file"]
        original_filename = safe_original_filename(
            uploaded_file.name
        )

        validated_data["original_filename"] = original_filename
        validated_data["file_size"] = uploaded_file.size

        if not validated_data.get("title"):
            validated_data["title"] = (
                Path(original_filename).stem[:200]
                or "Medical Report"
            )

        return super().create(validated_data)
