from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AssessmentSession
from .serializers import AssessmentSessionSerializer


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