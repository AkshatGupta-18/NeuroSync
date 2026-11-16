
from django.contrib import admin

from .models import MedicalReport


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "category",
        "file_size",
        "processing_status",
        "created_at",
    )

    list_filter = (
        "category",
        "processing_status",
        "created_at",
    )

    search_fields = (
        "title",
        "original_filename",
        "user__username",
    )

    readonly_fields = (
        "user",
        "original_filename",
        "file_size",
        "processing_status",
        "created_at",
        "updated_at",
    )

    exclude = ("file",)
