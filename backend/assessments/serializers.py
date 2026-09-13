import json
import os
import subprocess
import tempfile
from pathlib import Path

from rest_framework import serializers

from .models import AssessmentSession, AssessmentInput


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


class AssessmentInputSerializer(serializers.ModelSerializer):
    CLIENT_FORBIDDEN_FIELDS = {
        "id",
        "assessment",
        "status",
        "processed_at",
        "failure_reason",
        "created_at",
    }

    ALLOWED_EXTENSIONS = {
        AssessmentInput.InputType.VOICE: {".webm"},
        AssessmentInput.InputType.VIDEO: {".webm"},
    }

    ALLOWED_CONTENT_TYPES = {
        AssessmentInput.InputType.VOICE: {
            "audio/webm",
            "audio/webm;codecs=opus",
        },
        AssessmentInput.InputType.VIDEO: {
            "video/webm",
            "video/webm;codecs=vp8,opus",
            "video/webm;codecs=vp9,opus",
        },
    }

    MAX_FILE_SIZES = {
        AssessmentInput.InputType.VOICE: 50 * 1024 * 1024,
        AssessmentInput.InputType.VIDEO: 250 * 1024 * 1024,
    }

    EXPECTED_STREAMS = {
        AssessmentInput.InputType.VOICE: {
            "audio": {"opus"},
        },
        AssessmentInput.InputType.VIDEO: {
            "video": {"vp8", "vp9"},
            "audio": {"opus"},
        },
    }

    class Meta:
        model = AssessmentInput
        fields = [
            "id",
            "assessment",
            "input_type",
            "status",
            "file",
            "metadata",
            "created_at",
            "processed_at",
        ]
        read_only_fields = [
            "id",
            "assessment",
            "status",
            "created_at",
            "processed_at",
        ]

    def validate(self, attrs):
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

        input_type = attrs.get("input_type")
        uploaded_file = attrs.get("file")

        if input_type in self.ALLOWED_EXTENSIONS:
            if uploaded_file is None:
                raise serializers.ValidationError(
                    {
                        "file": (
                            f"A media file is required for "
                            f"{input_type} input."
                        )
                    }
                )

            extension = Path(uploaded_file.name).suffix.lower()

            if extension not in self.ALLOWED_EXTENSIONS[input_type]:
                allowed = ", ".join(
                    sorted(self.ALLOWED_EXTENSIONS[input_type])
                )

                raise serializers.ValidationError(
                    {
                        "file": (
                            f"Unsupported file extension '{extension}'. "
                            f"Allowed extensions: {allowed}."
                        )
                    }
                )

            content_type = (
                getattr(uploaded_file, "content_type", "") or ""
            ).lower()

            if content_type not in self.ALLOWED_CONTENT_TYPES[input_type]:
                allowed = ", ".join(
                    sorted(self.ALLOWED_CONTENT_TYPES[input_type])
                )

                raise serializers.ValidationError(
                    {
                        "file": (
                            f"Unsupported media type '{content_type}'. "
                            f"Allowed types: {allowed}."
                        )
                    }
                )

            max_size = self.MAX_FILE_SIZES[input_type]

            if uploaded_file.size > max_size:
                max_size_mb = max_size // (1024 * 1024)

                raise serializers.ValidationError(
                    {
                        "file": (
                            f"File is too large. "
                            f"Maximum allowed size is {max_size_mb} MB."
                        )
                    }
                )

            self._validate_media_file(
                uploaded_file,
                input_type,
            )

        elif input_type == AssessmentInput.InputType.COGNITIVE:
            if uploaded_file is not None:
                raise serializers.ValidationError(
                    {
                        "file": (
                            "Cognitive inputs must not contain a media file."
                        )
                    }
                )

        return attrs

    def _validate_media_file(self, uploaded_file, input_type):
        uploaded_file.seek(0)

        try:
            with tempfile.NamedTemporaryFile(
                suffix=Path(uploaded_file.name).suffix.lower(),
                delete=False,
            ) as temporary_file:
                for chunk in uploaded_file.chunks():
                    temporary_file.write(chunk)

                temporary_path = temporary_file.name

            command = [
                "ffprobe",
                "-v",
                "error",
                "-print_format",
                "json",
                "-show_format",
                "-show_streams",
                temporary_path,
            ]

            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=15,
                check=False,
            )

            if result.returncode != 0:
                raise serializers.ValidationError(
                    {
                        "file": (
                            "The uploaded media file could not be "
                            "verified as a valid media file."
                        )
                    }
                )

            try:
                probe_data = json.loads(result.stdout)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    {
                        "file": (
                            "The uploaded media file could not be "
                            "verified."
                        )
                    }
                )

            format_name = (
                probe_data.get("format", {})
                .get("format_name", "")
                .lower()
            )

            if "webm" not in format_name:
                raise serializers.ValidationError(
                    {
                        "file": (
                            "The uploaded file is not a valid WebM "
                            "media container."
                        )
                    }
                )

            streams = probe_data.get("streams", [])

            stream_codecs = {}

            for stream in streams:
                codec_type = stream.get("codec_type")
                codec_name = (
                    stream.get("codec_name") or ""
                ).lower()

                if codec_type and codec_name:
                    stream_codecs.setdefault(
                        codec_type,
                        set(),
                    ).add(codec_name)

            expected_streams = self.EXPECTED_STREAMS[input_type]

            for stream_type, allowed_codecs in expected_streams.items():
                available_codecs = stream_codecs.get(
                    stream_type,
                    set(),
                )

                if not available_codecs.intersection(
                    allowed_codecs
                ):
                    allowed = ", ".join(
                        sorted(allowed_codecs)
                    )

                    raise serializers.ValidationError(
                        {
                            "file": (
                                f"Invalid {stream_type} codec. "
                                f"Expected one of: {allowed}."
                            )
                        }
                    )

        except FileNotFoundError:
            raise serializers.ValidationError(
                {
                    "file": (
                        "Media validation is temporarily unavailable."
                    )
                }
            )

        except subprocess.TimeoutExpired:
            raise serializers.ValidationError(
                {
                    "file": (
                        "Media validation timed out. "
                        "Please upload a smaller or valid media file."
                    )
                }
            )

        finally:
            uploaded_file.seek(0)

            if "temporary_path" in locals():
                try:
                    os.remove(temporary_path)
                except OSError:
                    pass