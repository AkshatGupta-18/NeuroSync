from django.contrib.auth.models import User
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class AssessmentSession(models.Model):
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assessment_sessions",
        db_index=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CREATED,
        db_index=True,
    )

    stress_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
    )

    fatigue_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
    )

    mental_fitness_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
    )

    cognitive_fitness_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    failure_reason = models.TextField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(
                fields=["user", "-created_at"],
                name="assessment_user_created_idx",
            ),
            models.Index(
                fields=["status", "-created_at"],
                name="assessment_status_created_idx",
            ),
        ]

    def __str__(self):
        return f"Assessment #{self.pk} - {self.user.username}"