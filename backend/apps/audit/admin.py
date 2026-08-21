from django.contrib import admin

from apps.audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """
    AuditLog Admin
    """

    # ---------------------------------
    # list
    # ---------------------------------

    list_display = [
        "created_at",
        "level",
        "action",
        "view_name",
        "path",
        "username",
        "model_name",
    ]

    ordering = [
        "-created_at",
    ]

    # ---------------------------------
    # filter
    # ---------------------------------

    list_filter = [
        "level",
        "action",
        "view_name",
        "model_name",
        "created_at",
    ]

    # ---------------------------------
    # search
    # ---------------------------------

    search_fields = [
        "username",
        "action",
        "model_name",
        "detail",
        "ip_address",
    ]

    # ---------------------------------
    # readonly
    # ---------------------------------

    readonly_fields = [
        "uuid",
        "created_at",
        "created_by",
        "updated_at",
        "updated_by",
        "is_deleted",
        "deleted_at",
        "deleted_by",
        "user",
        "username",
        "action",
        "view_name",
        "path",
        "model_name",
        "object_id",
        "detail",
        "ip_address",
        "user_agent",
        "level",
        "before_data",
        "after_data",
        "changed_fields",
    ]

    # ---------------------------------
    # detail
    # ---------------------------------

    fieldsets = (
        (
            "Audit Info",
            {
                "fields": (
                    "level",
                    "action",
                    "view_name",
                    "path",
                    "user",
                    "username",
                    "model_name",
                    "object_id",
                )
            },
        ),
        (
            "Request Info",
            {
                "fields": (
                    "ip_address",
                    "user_agent",
                )
            },
        ),
        (
            "Diff",
            {
                "fields": (
                    "before_data",
                    "after_data",
                    "changed_fields",
                    "detail",
                )
            },
        ),
        (
            "System",
            {
                "fields": (
                    "uuid",
                    "created_at",
                    "created_by",
                    "updated_at",
                    "updated_by",
                    "is_deleted",
                    "deleted_at",
                    "deleted_by",
                )
            },
        ),
    )

    # ---------------------------------
    # navigation
    # ---------------------------------

    date_hierarchy = "created_at"

    # ---------------------------------
    # permissions
    # ---------------------------------

    def has_add_permission(
        self,
        request,
    ):
        return False

    def has_change_permission(
        self,
        request,
        obj=None,
    ):
        return False

    def has_delete_permission(
        self,
        request,
        obj=None,
    ):
        return False
