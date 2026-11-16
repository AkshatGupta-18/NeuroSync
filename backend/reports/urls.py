
from rest_framework.routers import DefaultRouter

from .views import MedicalReportViewSet


router = DefaultRouter()
router.register(
    "medical-records",
    MedicalReportViewSet,
    basename="medical-record",
)

urlpatterns = router.urls
