from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AssessmentSession, AssessmentInput
from .serializers import (
    AssessmentSessionSerializer,
    AssessmentInputSerializer,
)


class AssessmentSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AssessmentSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentSession.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AssessmentSessionDetailView(generics.RetrieveAPIView):
    serializer_class = AssessmentSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentSession.objects.filter(
            user=self.request.user
        )


class AssessmentInputListCreateView(generics.ListCreateAPIView):
    serializer_class = AssessmentInputSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentInput.objects.filter(
            assessment__user=self.request.user,
            assessment_id=self.kwargs["assessment_id"],
        ).order_by("created_at")

    def perform_create(self, serializer):
        assessment = get_object_or_404(
            AssessmentSession,
            id=self.kwargs["assessment_id"],
            user=self.request.user,
        )

        serializer.save(assessment=assessment)


class AssessmentInputDetailView(generics.RetrieveAPIView):
    serializer_class = AssessmentInputSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AssessmentInput.objects.filter(
            assessment__user=self.request.user,
            assessment_id=self.kwargs["assessment_id"],
        )