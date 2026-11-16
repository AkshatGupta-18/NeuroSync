from pathlib import Path

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.deconstruct import deconstructible


@deconstructible
class PrivateMedicalReportStorage(FileSystemStorage):
    def __init__(self):
        location = Path(settings.BASE_DIR) / "private_medical_records"

        super().__init__(
            location=location,
            base_url=None,
        )


private_report_storage = PrivateMedicalReportStorage()