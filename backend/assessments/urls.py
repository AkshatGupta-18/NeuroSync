from django.urls import path

from .views import (
    AssessmentSessionListCreateView,
    AssessmentSessionDetailView,
    AssessmentCompleteView,
    AssessmentInputListCreateView,
    AssessmentInputDetailView,
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
    path(
        "<int:assessment_id>/complete/",
        AssessmentCompleteView.as_view(),
        name="assessment-complete",
    ),
    path(
        "<int:assessment_id>/inputs/",
        AssessmentInputListCreateView.as_view(),
        name="assessment-input-list-create",
    ),
    path(
        "<int:assessment_id>/inputs/<int:pk>/",
        AssessmentInputDetailView.as_view(),
        name="assessment-input-detail",
    ),
]