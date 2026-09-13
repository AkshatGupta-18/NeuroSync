from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AssessmentSession, AssessmentInput
from .scoring import calculate_scores
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


class AssessmentCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assessment_id):
        assessment = get_object_or_404(
            AssessmentSession,
            id=assessment_id,
            user=request.user,
        )

        if assessment.status == AssessmentSession.Status.COMPLETED:
            return Response(
                {
                    "detail": "This assessment has already been completed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cognitive_input = (
            AssessmentInput.objects.filter(
                assessment=assessment,
                input_type=AssessmentInput.InputType.COGNITIVE,
            )
            .order_by("-created_at")
            .first()
        )

        if cognitive_input is None:
            return Response(
                {
                    "detail": (
                        "Cognitive assessment responses are required "
                        "before completing the assessment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        responses = cognitive_input.metadata.get("responses")

        try:
            scores = calculate_scores(responses)
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            processing_time = timezone.now()

            assessment.status = AssessmentSession.Status.PROCESSING
            assessment.save(update_fields=["status"])

            assessment.stress_score = scores["stress_score"]
            assessment.fatigue_score = scores["fatigue_score"]
            assessment.mental_fitness_score = scores[
                "mental_fitness_score"
            ]
            assessment.cognitive_fitness_score = scores[
                "cognitive_fitness_score"
            ]
            assessment.status = AssessmentSession.Status.COMPLETED
            assessment.completed_at = processing_time
            assessment.failure_reason = None

            assessment.save(
                update_fields=[
                    "stress_score",
                    "fatigue_score",
                    "mental_fitness_score",
                    "cognitive_fitness_score",
                    "status",
                    "completed_at",
                    "failure_reason",
                ]
            )

            cognitive_input.status = AssessmentInput.Status.PROCESSED
            cognitive_input.processed_at = processing_time
            cognitive_input.failure_reason = None

            cognitive_input.save(
                update_fields=[
                    "status",
                    "processed_at",
                    "failure_reason",
                ]
            )

        return Response(
            AssessmentSessionSerializer(assessment).data,
            status=status.HTTP_200_OK,
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