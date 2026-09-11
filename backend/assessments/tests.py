from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase

from .models import AssessmentSession


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