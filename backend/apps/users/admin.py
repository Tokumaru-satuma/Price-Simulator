from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .forms import UserChangeAdminForm, UserCreationAdminForm
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = UserCreationAdminForm
    form = UserChangeAdminForm

    list_display = (
        "id",
        "username",
        "name",
        "email",
        "role",
        "is_active",
        "is_staff",
        "created_at",
    )

    list_filter = (
        "role",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "username",
        "name",
        "email",
    )

    ordering = (
        "role",
        "name",
    )

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("基本情報", {"fields": ("name", "email", "role")}),
        ("権限", {"fields": ("is_active", "is_staff")}),
        ("日時", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "name",
                    "role",
                    "password1",
                    "password2",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    readonly_fields = (
        "last_login",
        "created_at",
        "updated_at",
    )

    filter_horizontal = ()
