import os
import subprocess
import tempfile

from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AssessmentInput, AssessmentSession


class MediaTestMixin:
    def create_voice_file(self):
        temporary_directory = tempfile.mkdtemp()

        output_path = os.path.join(
            temporary_directory,
            "test_voice.webm",
        )

        command = [
            "ffmpeg",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=1000:duration=1",
            "-c:a",
            "libopus",
            "-b:a",
            "64k",
            "-y",
            output_path,
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )

        self.assertEqual(
            result.returncode,
            0,
            msg=result.stderr,
        )

        with open(output_path, "rb") as media_file:
            content = media_file.read()

        return SimpleUploadedFile(
            "test_voice.webm",
            content,
            content_type="audio/webm",
        )

    def create_video_file(self):
        temporary_directory = tempfile.mkdtemp()

        output_path = os.path.join(
            temporary_directory,
            "test_video.webm",
        )

        command = [
            "ffmpeg",
            "-f",
            "lavfi",
            "-i",
            "testsrc=size=320x240:rate=15:duration=1",
            "-f",
            "lavfi",
            "-i",
            "sine=frequency=1000:duration=1",
            "-c:v",
            "libvpx",
            "-b:v",
            "500k",
            "-c:a",
            "libopus",
            "-b:a",
            "64k",
            "-shortest",
            "-y",
            output_path,
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
        )

        self.assertEqual(
            result.returncode,
            0,
            msg=result.stderr,
        )

        with open(output_path, "rb") as media_file:
            content = media_file.read()

        return SimpleUploadedFile(
            "test_video.webm",
            content,
            content_type="video/webm",
        )


class AssessmentSessionAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="assessment_user",
            email="assessment@example.com",
            password="TestPass123!",
        )

        self.other_user = User.objects.create_user(
            username="other_user",
            email="other@example.com",
            password="TestPass123!",
        )

        self.list_url = "/api/assessments/"

    def test_unauthenticated_user_cannot_access_assessments(self):
        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_create_assessment(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["status"],
            "created",
        )

        self.assertIsNone(
            response.data["stress_score"],
        )

        self.assertIsNone(
            response.data["fatigue_score"],
        )

        self.assertIsNone(
            response.data["mental_fitness_score"],
        )

        self.assertIsNone(
            response.data["cognitive_fitness_score"],
        )

    def test_created_assessment_belongs_to_authenticated_user(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {},
            format="json",
        )

        assessment_id = response.data["id"]

        assessment = AssessmentSession.objects.get(
            id=assessment_id
        )

        self.assertEqual(
            assessment.user,
            self.user,
        )

    def test_authenticated_user_can_list_own_assessments(self):
        AssessmentSession.objects.create(
            user=self.user
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.list_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["status"],
            "created",
        )

    def test_authenticated_user_can_retrieve_own_assessment(self):
        assessment = AssessmentSession.objects.create(
            user=self.user
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.list_url}{assessment.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            assessment.id,
        )

    def test_user_cannot_retrieve_another_users_assessment(self):
        assessment = AssessmentSession.objects.create(
            user=self.user
        )

        self.client.force_authenticate(
            user=self.other_user
        )

        response = self.client.get(
            f"{self.list_url}{assessment.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_nonexistent_assessment_returns_404(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.list_url}999999/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_client_cannot_set_assessment_results(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {
                "status": "completed",
                "stress_score": 95,
                "fatigue_score": 10,
                "mental_fitness_score": 90,
                "cognitive_fitness_score": 85,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "detail",
            response.data,
        )

    def test_client_cannot_set_assessment_owner(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.list_url,
            {
                "user": self.other_user.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "detail",
            response.data,
        )


class AssessmentInputAPITests(MediaTestMixin, APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="input_user",
            email="input@example.com",
            password="TestPass123!",
        )

        self.other_user = User.objects.create_user(
            username="other_input_user",
            email="otherinput@example.com",
            password="TestPass123!",
        )

        self.assessment = AssessmentSession.objects.create(
            user=self.user
        )

        self.other_assessment = AssessmentSession.objects.create(
            user=self.other_user
        )

        self.input_list_url = (
            f"/api/assessments/{self.assessment.id}/inputs/"
        )

    def test_unauthenticated_user_cannot_access_inputs(self):
        response = self.client.get(
            self.input_list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_create_input(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = self.create_voice_file()

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": (
                    '{"format": "webm", '
                    '"duration_seconds": 1}'
                ),
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["input_type"],
            "voice",
        )

        self.assertEqual(
            response.data["status"],
            "uploaded",
        )

        self.assertEqual(
            response.data["metadata"]["format"],
            "webm",
        )

        self.assertEqual(
            response.data["metadata"]["duration_seconds"],
            1,
        )

        self.assertTrue(
            response.data["file"]
        )

    def test_created_input_is_linked_to_authenticated_users_assessment(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = self.create_voice_file()

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": '{"format": "webm"}',
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        input_id = response.data["id"]

        assessment_input = AssessmentInput.objects.get(
            id=input_id
        )

        self.assertEqual(
            assessment_input.assessment,
            self.assessment,
        )

    def test_voice_input_requires_file(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": '{"format": "webm"}',
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_video_input_requires_file(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "video",
                "metadata": '{"format": "webm"}',
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_voice_input_rejects_wrong_file_extension(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = SimpleUploadedFile(
            "voice_test.mp3",
            b"test audio content",
            content_type="audio/webm",
        )

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": '{"format": "webm"}',
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_voice_input_rejects_wrong_content_type(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = SimpleUploadedFile(
            "voice_test.webm",
            b"test audio content",
            content_type="audio/mpeg",
        )

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": '{"format": "webm"}',
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_voice_input_rejects_oversized_file(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = SimpleUploadedFile(
            "large_voice.webm",
            b"test audio content",
            content_type="audio/webm",
        )

        uploaded_file.size = (50 * 1024 * 1024) + 1

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "metadata": '{"format": "webm"}',
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_cognitive_input_rejects_media_file(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = SimpleUploadedFile(
            "cognitive_test.webm",
            b"test media content",
            content_type="audio/webm",
        )

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "cognitive",
                "metadata": '{"type": "reaction_test"}',
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "file",
            response.data,
        )

    def test_authenticated_user_can_create_cognitive_input_without_file(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "cognitive",
                "metadata": {
                    "type": "reaction_test",
                },
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["input_type"],
            "cognitive",
        )

        self.assertEqual(
            response.data["status"],
            "uploaded",
        )

        self.assertEqual(
            response.data["metadata"],
            {
                "type": "reaction_test",
            },
        )

        self.assertFalse(
            response.data["file"]
        )

    def test_authenticated_user_can_create_video_input(self):
        self.client.force_authenticate(user=self.user)

        uploaded_file = self.create_video_file()

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "video",
                "metadata": (
                    '{"format": "webm", '
                    '"duration_seconds": 1}'
                ),
                "file": uploaded_file,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        self.assertEqual(
            response.data["input_type"],
            "video",
        )

        self.assertEqual(
            response.data["status"],
            "uploaded",
        )

        self.assertEqual(
            response.data["metadata"]["format"],
            "webm",
        )

        self.assertTrue(
            response.data["file"]
        )

    def test_authenticated_user_can_list_own_inputs(self):
        AssessmentInput.objects.create(
            assessment=self.assessment,
            input_type="voice",
            metadata={
                "format": "webm",
                "duration_seconds": 30,
            },
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            self.input_list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            len(response.data),
            1,
        )

        self.assertEqual(
            response.data[0]["input_type"],
            "voice",
        )

    def test_authenticated_user_can_retrieve_own_input(self):
        assessment_input = AssessmentInput.objects.create(
            assessment=self.assessment,
            input_type="voice",
            metadata={
                "format": "webm",
                "duration_seconds": 30,
            },
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"{self.input_list_url}{assessment_input.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["id"],
            assessment_input.id,
        )

    def test_user_cannot_list_another_users_inputs(self):
        AssessmentInput.objects.create(
            assessment=self.other_assessment,
            input_type="voice",
            metadata={
                "format": "webm",
            },
        )

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            f"/api/assessments/"
            f"{self.other_assessment.id}/inputs/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_user_cannot_retrieve_another_users_input(self):
        assessment_input = AssessmentInput.objects.create(
            assessment=self.other_assessment,
            input_type="voice",
            metadata={
                "format": "webm",
            },
        )

        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            f"/api/assessments/"
            f"{self.other_assessment.id}/inputs/"
            f"{assessment_input.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_input_for_nonexistent_assessment_returns_404(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            "/api/assessments/999999/inputs/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data,
            [],
        )

    def test_client_cannot_change_input_assessment(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.input_list_url,
            {
                "assessment": self.other_assessment.id,
                "input_type": "voice",
                "metadata": {
                    "format": "webm",
                },
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "detail",
            response.data,
        )

    def test_client_cannot_change_input_status(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            self.input_list_url,
            {
                "input_type": "voice",
                "status": "processed",
                "metadata": {
                    "format": "webm",
                },
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST,
        )

        self.assertIn(
            "detail",
            response.data,
        )