from rest_framework import serializers

from .models import AssessmentSession


class AssessmentSessionSerializer(serializers.ModelSerializer):
    CLIENT_FORBIDDEN_FIELDS = {
        "status",
        "stress_score",
        "fatigue_score",
        "mental_fitness_score",
        "cognitive_fitness_score",
        "created_at",
        "completed_at",
        "user",
        "failure_reason",
    }

    class Meta:
        model = AssessmentSession
        fields = [
            "id",
            "status",
            "stress_score",
            "fatigue_score",
            "mental_fitness_score",
            "cognitive_fitness_score",
            "created_at",
            "completed_at",
        ]
        read_only_fields = [
            "id",
            "status",
            "stress_score",
            "fatigue_score",
            "mental_fitness_score",
            "cognitive_fitness_score",
            "created_at",
            "completed_at",
        ]

    def validate(self, attrs):
        if self.instance is not None and attrs:
            raise serializers.ValidationError(
                "Assessment results cannot be modified through this endpoint."
            )

        forbidden_fields = (
            set(self.initial_data.keys())
            & self.CLIENT_FORBIDDEN_FIELDS
        )

        if forbidden_fields:
            fields = ", ".join(sorted(forbidden_fields))

            raise serializers.ValidationError(
                {
                    "detail": (
                        "The following fields are controlled by the "
                        f"server and cannot be provided by the client: {fields}."
                    )
                }
            )

        return attrs