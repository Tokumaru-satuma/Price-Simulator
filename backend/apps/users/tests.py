from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User


class UserManagementApiTests(APITestCase):
    password = "UserManagement-2026!"

    def create_user(self, username, role=User.RoleChoices.EDITOR, **kwargs):
        return User.objects.create_user(
            username=username,
            password=self.password,
            email=f"{username}@example.invalid",
            name=username,
            role=role,
            is_staff=role == User.RoleChoices.ADMIN,
            **kwargs,
        )

    def setUp(self):
        self.admin = self.create_user("admin", User.RoleChoices.ADMIN)
        self.client.force_authenticate(self.admin)

    def test_admin_can_create_user_and_is_staff_follows_role(self):
        response = self.client.post(
            "/users/users/",
            {
                "username": "new-admin",
                "password": self.password,
                "email": "new-admin@example.invalid",
                "name": "New Admin",
                "role": User.RoleChoices.ADMIN,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created = User.objects.get(username="new-admin")
        self.assertTrue(created.is_staff)
        self.assertTrue(created.check_password(self.password))

    def test_role_update_synchronizes_is_staff(self):
        user = self.create_user("editor")

        response = self.client.patch(
            f"/users/users/{user.uuid}/",
            {"role": User.RoleChoices.ADMIN},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.role, User.RoleChoices.ADMIN)
        self.assertTrue(user.is_staff)

    def test_admin_cannot_deactivate_demote_or_delete_self(self):
        detail_url = f"/users/users/{self.admin.uuid}/"

        deactivate = self.client.patch(detail_url, {"is_active": False}, format="json")
        demote = self.client.patch(
            detail_url,
            {"role": User.RoleChoices.EDITOR},
            format="json",
        )
        delete = self.client.delete(detail_url)

        self.assertEqual(deactivate.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(demote.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(delete.status_code, status.HTTP_400_BAD_REQUEST)

    def test_last_active_admin_cannot_be_changed_by_another_admin(self):
        second_admin = self.create_user("second-admin", User.RoleChoices.ADMIN)
        self.admin.is_active = False
        self.admin.save(update_fields=["is_active"])
        self.client.force_authenticate(second_admin)

        response = self.client.patch(
            f"/users/users/{self.admin.uuid}/",
            {"role": User.RoleChoices.EDITOR},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.patch(
            f"/users/users/{second_admin.uuid}/",
            {"is_active": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_is_soft_delete_and_restore_keeps_user_inactive(self):
        second_admin = self.create_user("second-admin", User.RoleChoices.ADMIN)
        user = self.create_user("target")

        delete = self.client.delete(f"/users/users/{user.uuid}/")
        self.assertEqual(delete.status_code, status.HTTP_200_OK)

        deleted = User.all_objects.get(pk=user.pk)
        self.assertTrue(deleted.is_deleted)
        self.assertFalse(deleted.is_active)

        restore = self.client.post(f"/users/users/{user.uuid}/restore/", {}, format="json")
        self.assertEqual(restore.status_code, status.HTTP_200_OK)

        restored = User.objects.get(pk=user.pk)
        self.assertFalse(restored.is_active)
        self.assertTrue(second_admin.is_active)

    def test_admin_password_reset_rejects_self_and_updates_other_user(self):
        target = self.create_user("target")
        new_password = "Reset-Password-2026!"

        self_response = self.client.patch(
            f"/users/{self.admin.uuid}/password/",
            {"password": new_password},
            format="json",
        )
        target_response = self.client.patch(
            f"/users/{target.uuid}/password/",
            {"password": new_password},
            format="json",
        )

        self.assertEqual(self_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(target_response.status_code, status.HTTP_200_OK)
        target.refresh_from_db()
        self.assertTrue(target.check_password(new_password))
