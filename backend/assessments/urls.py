from django.urls import path

from .views import (
    AssessmentSessionListCreateView,
    AssessmentSessionDetailView,
)


urlpatterns = [
    path(
        "",
        AssessmentSessionListCreateView.as_view(),
        name="assessment-list-create",
    ),
    path(
        "<int:pk>/",
        AssessmentSessionDetailView.as_view(),
        name="assessment-detail",
    ),
]