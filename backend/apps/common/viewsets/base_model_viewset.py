from django.db import transaction
from django.shortcuts import get_object_or_404

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)
from rest_framework import status
from rest_framework.viewsets import ModelViewSet

from drf_spectacular.utils import extend_schema, extend_schema_view

from apps.audit.constants import AuditAction
from apps.audit.services import AuditService

from apps.common.mixins import (
    CRUDMixin,
    ForceDeleteMixin,
    RestoreMixin,
    SoftDeleteMixin,
)


@extend_schema_view(
    list=extend_schema(
        summary="一覧",
        tags=["共通"],
    ),
    retrieve=extend_schema(
        summary="詳細",
        tags=["共通"],
    ),
    create=extend_schema(
        summary="作成",
        tags=["共通"],
    ),
    update=extend_schema(
        summary="更新",
        tags=["共通"],
    ),
    partial_update=extend_schema(
        summary="部分更新",
        tags=["共通"],
    ),
    destroy=extend_schema(
        summary="削除",
        tags=["共通"],
    ),
    force_destroy=extend_schema(
        summary="完全削除",
        description="論理削除済みのデータを物理削除します。先に論理削除が必要です。",
        tags=["共通"],
    ),
    restore=extend_schema(
        summary="復元",
        description="論理削除済みのデータを復元します。",
        tags=["共通"],
    ),
)
class BaseModelViewSet(
    CRUDMixin,
    SoftDeleteMixin,
    ForceDeleteMixin,
    RestoreMixin,
    ModelViewSet,
):
    """
    共通 Base ViewSet

    機能:
    - Role Permission
    - Logging
    - Exception Handling
    - Response Format
    - Soft Delete
    - Restore
    - Force Delete
    """

    # ---------------------------------
    # filter
    # ---------------------------------

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
        "deleted_at",
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
    # soft delete
    # ---------------------------------

    include_deleted_param = "include_deleted"

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

    # ---------------------------------
    # queryset
    # ---------------------------------

    def get_queryset(self):

        queryset = super().get_queryset()

        # ---------------------------------
        # admin only deleted data access
        # - 通常は、理論削除済みデータを含まない
        # - ?include_deleted=true で理論削除済みデータを含める
        # - ?only_deleted=true で理論削除済みデータのみを返す
        # - 管理者以外は、常に理論削除済みデータを含まない
        # ---------------------------------

        include_deleted = self.str_to_bool(
            self.request.query_params.get(self.include_deleted_param)
        )

        only_deleted = self.str_to_bool(self.request.query_params.get("only_deleted"))

        user = self.request.user

        is_admin = user.is_authenticated and user.role == "admin"

        if is_admin:

            if only_deleted:

                queryset = queryset.model.all_objects.filter(is_deleted=True)

            elif include_deleted:

                queryset = queryset.model.all_objects.all()

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

    def get_all_queryset(self):
        """
        論理削除済みを含む queryset を返す。

        restore / force_destroy など、
        削除済みデータへのアクセスが必要な処理で使用する。

        通常の get_queryset() は ActiveManager により
        is_deleted=False のみ返すため、
        restore 系処理では利用できない。
        """

        return self.queryset.model.all_objects.all()

    def get_all_object(self):
        """
        論理削除済みを含めて単一オブジェクトを取得する。

        lookup_field / lookup_url_kwarg に追従するため、
        restore / force_destroy 側では get_object() ではなく
        このメソッドを使用する。
        """

        queryset = self.get_all_queryset()

        filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_url_kwarg]}

        return get_object_or_404(
            queryset,
            **filter_kwargs,
        )

    # ---------------------------------
    # serializer
    # ---------------------------------

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
    # lifecycle hooks
    # ---------------------------------

    @transaction.atomic
    def perform_create(
        self,
        serializer,
    ):

        self.validate_or_raise(
            data=serializer.validated_data,
            context={
                "request": self.request,
                "view": self,
                "action": self.action,
            },
        )

        instance = serializer.save()

        after_data = AuditService.get_instance_snapshot(instance)

        self.log_action(
            request=self.request,
            action=AuditAction.CREATE,
            instance=instance,
            after_data=after_data,
        )

    @transaction.atomic
    def perform_update(
        self,
        serializer,
    ):

        before_data = AuditService.get_instance_snapshot(serializer.instance)

        self.validate_or_raise(
            data=serializer.validated_data,
            instance=serializer.instance,
            context={
                "request": self.request,
                "view": self,
                "action": self.action,
            },
        )

        instance = serializer.save()

        after_data = AuditService.get_instance_snapshot(instance)

        action = (
            AuditAction.PARTIAL_UPDATE
            if self.action == "partial_update"
            else AuditAction.UPDATE
        )

        self.log_action(
            request=self.request,
            action=action,
            instance=instance,
            before_data=before_data,
            after_data=after_data,
        )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        """作成後は詳細 Serializer を統一レスポンス形式で返す。"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        response_serializer_class = self.serializer_action_classes.get(
            "retrieve",
            self.get_serializer_class(),
        )
        response_serializer = response_serializer_class(
            serializer.instance,
            context=self.get_serializer_context(),
        )

        headers = self.get_success_headers(response_serializer.data)

        response = self.success(
            data=response_serializer.data,
            message="作成しました。",
            status_code=status.HTTP_201_CREATED,
        )

        for key, value in headers.items():
            response[key] = value

        return response

    # ---------------------------------
    # audit actions
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

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):

        response = super().update(
            request,
            *args,
            **kwargs,
        )

        return self.success(
            data=response.data,
            message="更新しました。",
            status_code=response.status_code,
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs,
    ):

        kwargs["partial"] = True

        response = super().update(
            request,
            *args,
            **kwargs,
        )

        return self.success(
            data=response.data,
            message="更新しました。",
            status_code=response.status_code,
        )
