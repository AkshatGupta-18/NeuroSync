from django.contrib.auth.models import User
from django.test import TestCase


class RegisterSerializerTests(TestCase):
    def test_register_user_without_email(self):
        from .serializers import RegisterSerializer

        serializer = RegisterSerializer(
            data={
                "username": "test_without_email",
                "password": "TestPass123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = serializer.save()

        self.assertEqual(user.username, "test_without_email")
        self.assertEqual(user.email, "")
        self.assertTrue(user.check_password("TestPass123!"))
        self.assertTrue(
            User.objects.filter(username="test_without_email").exists()
        )

    def test_register_user_with_email(self):
        from .serializers import RegisterSerializer

        serializer = RegisterSerializer(
            data={
                "username": "test_with_email",
                "email": "test@example.com",
                "password": "TestPass123!",
            }
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = serializer.save()

        self.assertEqual(user.username, "test_with_email")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("TestPass123!"))