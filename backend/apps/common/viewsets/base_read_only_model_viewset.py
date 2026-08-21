from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)
from rest_framework.viewsets import ReadOnlyModelViewSet

from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.audit.constants import AuditAction

from apps.common.mixins import CRUDMixin


@extend_schema_view(
    list=extend_schema(
        summary="一覧",
        tags=["共通"],
    ),
    retrieve=extend_schema(
        summary="詳細",
        tags=["共通"],
    ),
)
class BaseReadOnlyModelViewSet(
    CRUDMixin,
    ReadOnlyModelViewSet,
):
    """
    共通 ReadOnly ViewSet

    機能:
    - Role Permission
    - Logging
    - Exception Handling
    - Response Format
    - Filter
    - Search
    - Ordering
    - Audit
    """

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = []

    ordering = [
        "-created_at",
    ]

    ordering_fields = [
        "id",
        "uuid",
        "created_at",
        "updated_at",
    ]

    # ---------------------------------
    # queryset optimization
    # ---------------------------------

    select_related_fields = []

    prefetch_related_fields = []

    select_related_action_fields = {
        "retrieve": [
            "created_by",
            "updated_by",
            "deleted_by",
        ],
    }

    prefetch_related_action_fields = {}

    # ---------------------------------
    # serializer
    # ---------------------------------

    serializer_action_classes = {}

    # ---------------------------------
    # audit
    # ---------------------------------

    enable_list_audit = True

    enable_retrieve_audit = True

    # ---------------------------------
    # list success message
    # ---------------------------------

    list_success_message = "一覧を取得しました。"

    # ---------------------------------
    # lookup
    # ---------------------------------

    lookup_field = "uuid"

    lookup_url_kwarg = "uuid"

    @staticmethod
    def str_to_bool(value):

        return str(value).lower() in (
            "true",
            "1",
            "yes",
            "y",
        )

    def get_queryset(self):

        queryset = super().get_queryset()

        # ---------------------------------
        # select_related
        # ---------------------------------
        select_related_fields = list(
            set(
                self.select_related_fields
                + self.select_related_action_fields.get(
                    self.action,
                    [],
                )
            )
        )

        if select_related_fields:

            queryset = queryset.select_related(*select_related_fields)

        # ---------------------------------
        # prefetch_related
        # ---------------------------------

        prefetch_related_fields = list(
            set(
                self.prefetch_related_fields
                + self.prefetch_related_action_fields.get(
                    self.action,
                    [],
                )
            )
        )

        if prefetch_related_fields:

            queryset = queryset.prefetch_related(*prefetch_related_fields)

        return queryset

    def get_serializer_class(self):

        return self.serializer_action_classes.get(
            self.action,
            self.serializer_class,
        )

    # ---------------------------------
    # response message
    # ---------------------------------

    def get_list_success_message(self):

        return self.list_success_message

    # ---------------------------------
    # log for custom action "GET"
    # ---------------------------------

    def log_custom_list_action(
        self,
        *,
        request,
        instance=None,
        detail="",
    ):
        self.log_action(
            request=request,
            action=AuditAction.LIST,
            instance=instance,
            detail=detail,
        )

    def log_custom_retrieve_action(
        self,
        *,
        request,
        instance,
        detail="",
    ):
        self.log_action(
            request=request,
            action=AuditAction.RETRIEVE,
            instance=instance,
            detail=detail,
        )

    def set_pagination_message(
        self,
        message,
    ):

        if self.paginator is not None:

            self.paginator.message = message

    def get_paginated_success_response(
        self,
        data,
        message=None,
    ):

        if self.paginator is not None:

            return self.paginator.get_paginated_response(
                data,
                message=message,
            )

        return self.success(
            data=data,
            message=message or "success",
        )

    # ---------------------------------
    # audit hooks
    # ---------------------------------

    def list(
        self,
        request,
        *args,
        **kwargs,
    ):

        self.set_pagination_message(
            self.get_list_success_message(),
        )

        response = super().list(
            request,
            *args,
            **kwargs,
        )

        if self.enable_list_audit:

            self.log_action(
                request=request,
                action=AuditAction.LIST,
                detail=f"query_params_keys={list(request.query_params.keys())}",
            )

        return response

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ):

        instance = self.get_object()

        response = super().retrieve(
            request,
            *args,
            **kwargs,
        )

        if self.enable_retrieve_audit:

            self.log_action(
                request=request,
                action=AuditAction.RETRIEVE,
                instance=instance,
            )

        return self.success(
            data=response.data,
            message="詳細を取得しました。",
            status_code=response.status_code,
        )
