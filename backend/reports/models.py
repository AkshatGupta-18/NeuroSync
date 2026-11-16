
import uuid
from pathlib import Path

from django.conf import settings
from django.db import models

from .storage import private_report_storage


def medical_report_upload_path(instance, filename):
    extension = Path(filename).suffix.lower()
    return f"medical_reports/{instance.user_id}/{uuid.uuid4().hex}{extension}"


class MedicalReport(models.Model):

    class Category(models.TextChoices):
        BLOOD_TEST = "blood_test", "Blood Test"
        URINE_TEST = "urine_test", "Urine Test"
        IMAGING = "imaging", "Imaging"
        PRESCRIPTION = "prescription", "Prescription"
        OTHER = "other", "Other"

    class ProcessingStatus(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medical_reports",
        db_index=True,
    )

    title = models.CharField(max_length=200)

    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.OTHER,
        db_index=True,
    )

    original_filename = models.CharField(max_length=255)

    file = models.FileField(
        storage=private_report_storage,
        upload_to=medical_report_upload_path,
    )

    file_size = models.PositiveBigIntegerField()

    report_date = models.DateField(null=True, blank=True)

    processing_status = models.CharField(
        max_length=20,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.UPLOADED,
        db_index=True,
    )

    # Extracted source text is retained for verification and reprocessing.
    extracted_text = models.TextField(blank=True, default="")

    extraction_method = models.CharField(
        max_length=30,
        blank=True,
        default="",
    )

    processing_error = models.CharField(
        max_length=500,
        blank=True,
        default="",
    )

    processed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "-created_at"],
                name="medical_report_user_date_idx",
            ),
            models.Index(
                fields=["user", "category"],
                name="medical_report_user_cat_idx",
            ),
        ]

    def __str__(self):
        return f"{self.title} - User #{self.user_id}"

    def delete(self, *args, **kwargs):
        if self.file:
            self.file.delete(save=False)

        return super().delete(*args, **kwargs)


class MedicalMeasurement(models.Model):

    class ResultStatus(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        ABNORMAL = "abnormal", "Abnormal"
        UNKNOWN = "unknown", "Unknown"

    class VerificationStatus(models.TextChoices):
        MACHINE_EXTRACTED = "machine_extracted", "Machine Extracted"
        USER_VERIFIED = "user_verified", "User Verified"

    report = models.ForeignKey(
        MedicalReport,
        on_delete=models.CASCADE,
        related_name="measurements",
    )

    analyte_name = models.CharField(max_length=150)
    normalized_name = models.CharField(max_length=150, db_index=True)

    value = models.DecimalField(
        max_digits=14,
        decimal_places=4,
        null=True,
        blank=True,
    )

    qualitative_value = models.CharField(
        max_length=200,
        blank=True,
        default="",
    )

    unit = models.CharField(max_length=50, blank=True, default="")

    reference_range_text = models.CharField(
        max_length=150,
        blank=True,
        default="",
    )

    reference_min = models.DecimalField(
        max_digits=14,
        decimal_places=4,
        null=True,
        blank=True,
    )

    reference_max = models.DecimalField(
        max_digits=14,
        decimal_places=4,
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=ResultStatus.choices,
        default=ResultStatus.UNKNOWN,
        db_index=True,
    )

    source_text = models.TextField(blank=True, default="")

    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
    )

    page_number = models.PositiveIntegerField(null=True, blank=True)

    verification_status = models.CharField(
        max_length=30,
        choices=VerificationStatus.choices,
        default=VerificationStatus.MACHINE_EXTRACTED,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        indexes = [
            models.Index(
                fields=["report", "normalized_name"],
                name="measurement_report_name_idx",
            ),
        ]

    def __str__(self):
        return f"{self.analyte_name}: {self.value} {self.unit}"


class MedicalAnalysis(models.Model):

    class AttentionLevel(models.TextChoices):
        INFORMATIONAL = "informational", "Informational"
        FOLLOW_UP = "follow_up", "Follow-up Recommended"
        PROMPT = "prompt", "Prompt Medical Review"
        URGENT = "urgent", "Urgent Medical Attention"

    report = models.OneToOneField(
        MedicalReport,
        on_delete=models.CASCADE,
        related_name="analysis",
    )

    summary = models.TextField(blank=True, default="")

    attention_level = models.CharField(
        max_length=20,
        choices=AttentionLevel.choices,
        default=AttentionLevel.INFORMATIONAL,
        db_index=True,
    )

    possible_patterns = models.JSONField(default=list, blank=True)

    recommendations = models.JSONField(default=list, blank=True)

    rules_version = models.CharField(
        max_length=30,
        default="1.0",
    )

    generated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Analysis for report #{self.report_id}"


class MedicalAnalysisFinding(models.Model):

    class FindingType(models.TextChoices):
        NORMAL = "normal", "Normal Finding"
        ABNORMAL = "abnormal", "Abnormal Finding"
        PATTERN = "pattern", "Possible Pattern"
        ATTENTION = "attention", "Attention Required"

    analysis = models.ForeignKey(
        MedicalAnalysis,
        on_delete=models.CASCADE,
        related_name="findings",
    )

    measurement = models.ForeignKey(
        MedicalMeasurement,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="analysis_findings",
    )

    finding_type = models.CharField(
        max_length=20,
        choices=FindingType.choices,
    )

    medical_term = models.CharField(max_length=200)

    simple_term = models.CharField(max_length=200)

    medical_explanation = models.TextField()

    simple_explanation = models.TextField()

    recommendation = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.medical_term} - {self.finding_type}"
