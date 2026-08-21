from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager

from apps.common.models import BaseModel


from django.contrib.auth.base_user import BaseUserManager

from apps.common.models.querysets import ActiveQuerySet


class UserManager(BaseUserManager.from_queryset(ActiveQuerySet)):
    """
    User管理用Manager

    - is_deleted=False のみ取得
    """

    def get_queryset(self):

        return (
            super()
            .get_queryset()
            .filter(
                is_deleted=False,
            )
        )

    def create_user(self, username, password=None, **extra_fields):

        if not username:
            raise ValueError("username is required")

        user = self.model(
            username=username,
            **extra_fields,
        )

        user.set_password(password)

        user.save(using=self._db)

        return user

    def create_superuser(self, username, password=None, **extra_fields):

        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "admin")

        return self.create_user(
            username=username,
            password=password,
            **extra_fields,
        )


class User(AbstractBaseUser, BaseModel):
    """
    User管理用Model
    - AbstractBaseUser(field:password, last_login)を継承
    - BaseModelを継承
    - is_staff: adminログイン権限
    """

    class RoleChoices(models.TextChoices):
        ADMIN = "admin", "管理者"
        EDITOR = "editor", "登録ユーザー"
        VIEWER = "viewer", "閲覧ユーザー"

    username = models.CharField(max_length=25, unique=True, verbose_name="ログインID")
    email = models.EmailField(unique=True, verbose_name="メールアドレス")
    name = models.CharField(max_length=25, verbose_name="氏名")
    role = models.CharField(
        max_length=20,
        choices=RoleChoices.choices,
        default=RoleChoices.EDITOR,
        verbose_name="権限",
    )

    is_staff = models.BooleanField(default=False, verbose_name="管理画面権限")
    is_active = models.BooleanField(default=True, verbose_name="有効/無効")

    # ログイン用ID
    USERNAME_FIELD = "username"

    # superuser制作の時の必須項目
    REQUIRED_FIELDS = ["name", "email"]

    objects = UserManager()

    class Meta:
        verbose_name = "ユーザー"
        verbose_name_plural = "ユーザー"
        ordering = ["role", "name"]

    def __str__(self):
        return self.name

    def has_perm(self, perm, obj=None):
        return self.role == self.RoleChoices.ADMIN

    def has_module_perms(self, app_label):
        return self.role == self.RoleChoices.ADMIN
