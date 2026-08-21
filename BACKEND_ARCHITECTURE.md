# バックエンドアーキテクチャ詳細ドキュメント

共通基盤の各基底クラス・Mixin・サービスの詳細説明。

---

## 目次

1. [BaseModel](#1-basemodel)
2. [Manager / QuerySet](#2-manager--queryset)
3. [BaseModelViewSet](#3-basemodelviewset)
4. [BaseReadOnlyModelViewSet](#4-basereadonlymodelviewset)
5. [Serializer基底クラス](#5-serializer基底クラス)
6. [BaseAPIView](#6-baseapiview)
7. [Mixin一覧](#7-mixin一覧)
8. [Permission](#8-permission)
9. [AuditService](#9-auditservice)
10. [OpenAPI共通関数](#10-openapi共通関数)
11. [レスポンス形式](#11-レスポンス形式)
12. [例外ハンドリング](#12-例外ハンドリング)
13. [環境別セキュリティ設定](#13-環境別セキュリティ設定)

---

## 1. BaseModel

**場所**：`apps/common/models/base_model.py`

全モデルの基底抽象クラス。全モデルはこれを継承する。

### フィールド

```python
uuid            UUIDField       # 論理キー。APIのlookup_fieldに使用。DBのPKはidだが外部公開しない
created_at      DateTimeField   # 作成日時（auto_now_add）
created_by      FK(User)        # 作成者（SET_NULL）
updated_at      DateTimeField   # 更新日時（auto_now）
updated_by      FK(User)        # 更新者（SET_NULL）
is_deleted      BooleanField    # 論理削除フラグ（default=False）
deleted_at      DateTimeField   # 論理削除日時（nullable）
deleted_by      FK(User)        # 論理削除者（SET_NULL、nullable）
```

### Manager

```python
objects     = ActiveManager()   # is_deleted=False のみ返す（通常操作用）
all_objects = models.Manager()  # 論理削除済みを含む全件（restore/force_destroy用）
```

### インデックス

```python
indexes = [
    models.Index(fields=["is_deleted"]),
    models.Index(fields=["created_at"]),
]
```

### 使用例

```python
from apps.common.models import BaseModel

class MyModel(BaseModel):
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "モデル名"
```

---

## 2. Manager / QuerySet

**場所**：`apps/common/models/managers.py` / `querysets.py`

### ActiveManager

```python
class ActiveManager(models.Manager):
    def get_queryset(self):
        return ActiveQuerySet(self.model, using=self._db).filter(is_deleted=False)
```

`BaseModel.objects` として登録。通常の `all()` / `filter()` / `get()` は全て `is_deleted=False` のみ対象になる。

### ActiveQuerySet

```python
class ActiveQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)
```

### 注意点

`User` モデルも `AbstractBaseUser` と `BaseModel` を多重継承できる。
ただし、認証用のユーザー作成処理や `create_superuser()` が必要なため、
`BaseModel.objects` の `ActiveManager` をそのまま使わず、
`BaseUserManager` をベースにした専用の `UserManager` を実装している。
`UserManager.get_queryset()` では、通常モデルと同じく `is_deleted=False` フィルタを追加している。

```python
class UserManager(BaseUserManager.from_queryset(ActiveQuerySet)):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
```

---

## 3. BaseModelViewSet

**場所**：`apps/common/viewsets/base_model_viewset.py`

CRUD・論理削除・復元・物理削除を備えた共通ViewSet。

### 継承構造

```python
class BaseModelViewSet(
    CRUDMixin,          # Logging / Exception / Permission / Response / Validation
    SoftDeleteMixin,    # destroy → 論理削除
    ForceDeleteMixin,   # force_destroy → 物理削除
    RestoreMixin,       # restore → 復元
    ModelViewSet,       # DRF標準CRUD
):
```

### クラス変数（子クラスで上書き可能）

```python
# フィルタ
filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
search_fields = []
ordering = ["-created_at"]
ordering_fields = ["id", "uuid", "created_at", "updated_at", "deleted_at"]

# クエリ最適化
select_related_fields = []          # 全actionで適用
prefetch_related_fields = []
select_related_action_fields = {    # action別で追加適用
    "retrieve": ["created_by", "updated_by", "deleted_by"],
}
prefetch_related_action_fields = {}

# Serializer切り替え
serializer_action_classes = {}      # action名: Serializer クラス

# 監査
enable_list_audit = True
enable_retrieve_audit = True

# 論理削除済みアクセス
include_deleted_param = "include_deleted"  # ?include_deleted=true

# lookup
lookup_field = "uuid"
lookup_url_kwarg = "uuid"
```

### action別Serializer切り替え

```python
serializer_action_classes = {
    "list": UserListSerializer,
    "retrieve": UserDetailSerializer,
    "create": UserCreateSerializer,
    "update": UserUpdateSerializer,
    "partial_update": UserUpdateSerializer,
}
```

`get_serializer_class()` が `serializer_action_classes` を参照し、未定義の場合は `serializer_class` にフォールバック。

### 論理削除済みデータのアクセス制御

adminユーザーのみ以下のクエリパラメータが使用可能：

```
?include_deleted=true   # 全件（論理削除済み含む）
?only_deleted=true      # 論理削除済みのみ
```

### get_all_object()

`restore` / `force_destroy` 専用の単一オブジェクト取得メソッド。
`get_object()` は `ActiveManager` 経由のため論理削除済みが取得できない。
このメソッドは `all_objects` 経由で取得する。

```python
def get_all_object(self):
    queryset = self.queryset.model.all_objects.all()
    filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_url_kwarg]}
    return get_object_or_404(queryset, **filter_kwargs)
```

### perform_create / perform_update

自動的に AuditLog を記録する。
`before_data` / `after_data` は `AuditService.get_instance_snapshot()` で取得。

```python
@transaction.atomic
def perform_create(self, serializer):
    self.validate_or_raise(...)
    instance = serializer.save()
    after_data = AuditService.get_instance_snapshot(instance)
    self.log_action(request=self.request, action=AuditAction.CREATE, ...)

@transaction.atomic
def perform_update(self, serializer):
    before_data = AuditService.get_instance_snapshot(serializer.instance)
    self.validate_or_raise(...)
    instance = serializer.save()
    after_data = AuditService.get_instance_snapshot(instance)
    self.log_action(request=self.request, action=AuditAction.PARTIAL_UPDATE, ...)
```

### 標準 CRUD の成功レスポンス

`BaseModelViewSet` は標準 CRUD の成功レスポンスをすべて `success_response()` 形式で返す。

- `retrieve` / `update` / `partial_update`: HTTP 200、詳細 Serializer の JSON を `data` に格納する。
- `create`: HTTP 201、詳細 Serializer の JSON を `data` に格納する。
- `list`: HTTP 200、`data.items` と `data.pagination` を返す。

`BaseReadOnlyModelViewSet.retrieve` も同じく HTTP 200 の統一レスポンス形式を返す。

### 使用例

```python
from apps.common.viewsets import BaseModelViewSet
from apps.common.permissions import IsAdmin
from apps.common.openapi import base_responses

_r = base_responses(
    prefix="User",
    list_serializer=UserListSerializer,
    retrieve_serializer=UserDetailSerializer,
    create_serializer=UserDetailSerializer,
    update_serializer=UserDetailSerializer,
)

@extend_schema_view(
    list=extend_schema(summary="ユーザー一覧", responses=_r["list"], tags=["ユーザー管理"]),
    retrieve=extend_schema(summary="ユーザー詳細", responses=_r["retrieve"], tags=["ユーザー管理"]),
    create=extend_schema(summary="ユーザー作成", responses=_r["create"], tags=["ユーザー管理"]),
    update=extend_schema(summary="ユーザー更新", responses=_r["update"], tags=["ユーザー管理"]),
    partial_update=extend_schema(summary="ユーザー部分更新", responses=_r["partial_update"], tags=["ユーザー管理"]),
    destroy=extend_schema(summary="ユーザー削除", responses=_r["destroy"], tags=["ユーザー管理"]),
    force_destroy=extend_schema(summary="ユーザー完全削除", responses=_r["force_destroy"], tags=["ユーザー管理"]),
    restore=extend_schema(summary="ユーザー復元", responses=_r["restore"], tags=["ユーザー管理"]),
)
class UserViewSet(BaseModelViewSet):
    queryset = User.objects.all()
    permission_classes = [IsAdmin]
    filterset_class = UserFilter
    search_fields = ["username", "email", "name"]
    serializer_action_classes = {
        "list": UserListSerializer,
        "retrieve": UserDetailSerializer,
        "create": UserCreateSerializer,
        "update": UserUpdateSerializer,
        "partial_update": UserUpdateSerializer,
    }
```

---

## 4. BaseReadOnlyModelViewSet

**場所**：`apps/common/viewsets/base_read_only_model_viewset.py`

`list` / `retrieve` のみの読み取り専用ViewSet。

### 継承構造

```python
class BaseReadOnlyModelViewSet(
    CRUDMixin,
    ReadOnlyModelViewSet,
):
```

### BaseModelViewSet との違い

```
・SoftDeleteMixin / ForceDeleteMixin / RestoreMixin なし
・get_all_object() なし
・include_deleted / only_deleted パラメータなし
・perform_create / perform_update なし
```

### 使用例

```python
from apps.common.viewsets import BaseReadOnlyModelViewSet
from apps.common.openapi import readonly_responses

_r = readonly_responses(
    prefix="AuditLog",
    list_serializer=AuditLogListSerializer,
    retrieve_serializer=AuditLogDetailSerializer,
)

@extend_schema_view(
    list=extend_schema(summary="監査ログ一覧", responses=_r["list"], tags=["監査ログ"]),
    retrieve=extend_schema(summary="監査ログ詳細", responses=_r["retrieve"], tags=["監査ログ"]),
)
class AuditLogViewSet(BaseReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    permission_classes = [IsAdmin]
    serializer_action_classes = {
        "retrieve": AuditLogDetailSerializer,
    }
    serializer_class = AuditLogListSerializer
    enable_list_audit = False    # 監査ログの再帰防止
    enable_retrieve_audit = False
```

---

## 5. Serializer基底クラス

**場所**：`apps/common/serializers/`

### BaseModelSerializer

全Serializerの基底クラス。共通フィールドと `create` / `update` 時のユーザー自動セットを提供。

```python
class BaseModelSerializer(serializers.ModelSerializer):
    id          = IntegerField(read_only=True)
    uuid        = UUIDField(read_only=True)
    created_at  = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    updated_at  = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    is_deleted  = BooleanField(read_only=True)
    deleted_at  = DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    def get_request_user(self):
        # context["request"] からユーザーを取得

    def create(self, validated_data):
        validated_data["created_by"] = user
        validated_data["updated_by"] = user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data["updated_by"] = user
        return super().update(instance, validated_data)
```

### BaseListSerializer

一覧表示用。最小限のフィールドのみ。

```python
class BaseListSerializer(BaseModelSerializer):
    class Meta:
        fields = ["uuid", "created_at", "updated_at"]
```

子クラスでの拡張：
```python
class UserListSerializer(BaseListSerializer):
    class Meta:
        model = User
        fields = BaseListSerializer.Meta.fields + ["name", "username", "role"]
        read_only_fields = fields
```

### BaseDetailSerializer

詳細表示用。作成者・更新者情報を含む。

```python
class BaseDetailSerializer(BaseModelSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    updated_by = SimpleUserSerializer(read_only=True)
    deleted_by = SimpleUserSerializer(read_only=True)

    class Meta:
        fields = [
            "uuid", "created_at", "created_by",
            "updated_at", "updated_by",
            "is_deleted", "deleted_at", "deleted_by",
        ]
```

### BaseCreateUpdateSerializer

作成・更新用。read_only フィールドを最小限にする。

```python
class BaseCreateUpdateSerializer(BaseModelSerializer):
    # 入力フィールドのみ定義
    # create/update は BaseModelSerializer から継承
```

### SimpleUserSerializer

他モデルの `created_by` 等に使う簡易ユーザー表示用。

```python
class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["uuid", "username", "name"]
```

---

## 6. BaseAPIView

**場所**：`apps/common/views/base_apiview.py`

ViewSet ではなく個別エンドポイント用の基底クラス。

```python
class BaseAPIView(
    LoggingMixin,
    ExceptionMixin,
    ValidationMixin,
    APIView,
):
    pass
```

### ViewSet との使い分け

```
BaseModelViewSet     → CRUD操作が必要なリソース（User、License等）
BaseAPIView          → 単一目的のエンドポイント（Login、Me、PasswordChange等）
```

### extend_schema の付け方

`BaseAPIView` では `@extend_schema_view` をクラスに付ける：

```python
@extend_schema_view(
    get=extend_schema(
        summary="自分のプロフィール取得",
        responses={200: success_schema("UserMeResponse", {...})},
        tags=["ユーザー"],
    ),
    patch=extend_schema(
        summary="自分のプロフィール更新",
        request=UserMeUpdateSerializer,
        responses={200: success_schema("UserMeUpdateResponse", {...})},
        tags=["ユーザー"],
    ),
)
class UserMeAPIView(BaseAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request): ...
    def patch(self, request): ...
```

---

## 7. Mixin一覧

### CRUDMixin

以下のMixinをまとめたもの。`BaseModelViewSet` / `BaseAPIView` が継承する。

```python
class CRUDMixin(
    RolePermissionViewSetMixin,
    LoggingMixin,
    ExceptionMixin,
    ResponseMixin,
    ValidationMixin,
):
    pass
```

### LoggingMixin

`log_action()` メソッドを提供。`AuditService.log_action()` に委譲する。

```python
def log_action(self, *, request, action, **kwargs):
    AuditService.log_action(
        view_name=self.__class__.__name__,
        request=request,
        action=action,
        **kwargs,
    )
```

### SoftDeleteMixin

`destroy()` を論理削除に置き換える。

```python
@transaction.atomic
def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    instance.is_deleted = True
    instance.deleted_at = timezone.now()
    instance.deleted_by = request.user
    instance.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])
    self.log_action(request=request, action=AuditAction.SOFT_DELETE, instance=instance)
    return success_response(message="削除しました。")
```

### RestoreMixin

`restore` アクション（POST `/{uuid}/restore/`）を追加。
論理削除済みを取得するため `get_all_object()` を使用。

```python
@action(detail=True, methods=["post"])
@transaction.atomic
def restore(self, request, **kwargs):
    instance = self.get_all_object()    # ← get_object() ではなく get_all_object()
    if not instance.is_deleted:
        return error_response(message="削除されていません。", status_code=400)
    instance.is_deleted = False
    instance.deleted_at = None
    instance.deleted_by = None
    instance.save(update_fields=["is_deleted", "deleted_at", "deleted_by"])
    self.log_action(request=request, action=AuditAction.RESTORE, instance=instance)
    return success_response(message="復元しました。")
```

### ForceDeleteMixin

`force_destroy` アクション（DELETE `/{uuid}/force/`）を追加。
論理削除済みのみ物理削除可能。

```python
@action(detail=True, methods=["delete"], url_path="force")
@transaction.atomic
def force_destroy(self, request, *args, **kwargs):
    instance = self.get_all_object()    # ← get_object() ではなく get_all_object()
    if not instance.is_deleted:
        return error_response(message="先に論理削除してください。", status_code=400)
    self.log_action(request=request, action=AuditAction.FORCE_DELETE, instance=instance, level="warning")
    instance.delete()
    return success_response(message="完全削除しました。")
```

### ResponseMixin

`success()` / `error()` メソッドを提供。

```python
def success(self, data=None, message="success", status_code=200):
    return success_response(message=message, data=data, status_code=status_code)

def error(self, message="error", errors=None, status_code=400):
    return error_response(message=message, errors=errors, status_code=status_code)
```

### ExceptionMixin

DRFの例外を `AuditService` に記録し、統一レスポンス形式で返す。

### ValidationMixin

`validate_or_raise()` メソッドを提供。ビジネスバリデーションルールを実行する。

```python
def validate_or_raise(self, *, data, instance=None, context):
    # ValidationService経由でルールを実行
    # エラーがあれば例外を発生させる
```

---

## 8. Permission

**場所**：`apps/common/permissions/`

### Role階層

```python
ROLE_LEVEL = {
    "viewer": 1,
    "editor": 2,
    "admin":  3,
}
```

上位ロールは下位ロールの権限を包含する。

### Permission クラス

```python
IsViewer    # viewer以上（全認証ユーザー）
IsEditor    # editor以上
IsAdmin     # adminのみ
```

### ViewSetへの適用

```python
# クラス全体に適用
permission_classes = [IsAdmin]

# DEFAULT_PERMISSION_MAP_FOR_VIEWSET を使う場合
# constants.py に action別デフォルトが定義されている
DEFAULT_PERMISSION_MAP_FOR_VIEWSET = {
    "list":           IsViewer,
    "retrieve":       IsViewer,
    "create":         IsEditor,
    "update":         IsEditor,
    "partial_update": IsEditor,
    "destroy":        IsEditor,
    "force_destroy":  IsAdmin,
    "restore":        IsAdmin,
}
```

### ユーティリティ

```python
# ユーザーのロールレベルを取得
get_role_level(user)  # → int

# 最低ロール要件チェック
has_min_role(user, "editor")  # → bool

# ロールに応じたパーミッション辞書取得
get_permissions_from_role(role)
# → {"is_viewer": True, "is_editor": True, "is_admin": False}
```

---

## 9. AuditService

**場所**：`apps/audit/services/audit_service.py`

全API操作の監査ログを `AuditLog` モデルに記録するサービス。

### log_action()

```python
AuditService.log_action(
    request=request,
    action=AuditAction.CREATE,
    instance=instance,          # optional
    before_data=before_data,    # optional（更新前スナップショット）
    after_data=after_data,      # optional（更新後スナップショット）
    detail="",                  # optional（補足情報）
    level="info",               # info / warning / error
    view_name="",               # ViewSet名（LoggingMixinが自動設定）
    user=None,                  # 未指定時はrequest.userを使用
    exception=None,             # 例外オブジェクト（エラー時）
)
```

### get_instance_snapshot()

モデルインスタンスの全フィールド値をJSON安全な辞書で返す。

```python
snapshot = AuditService.get_instance_snapshot(instance)
# → {"id": 1, "uuid": "xxx", "name": "テスト", "created_at": "2026-05-28T14:56:06", ...}
```

**JSON非対応型の自動変換**：

```
datetime / date  → isoformat() 文字列
UUID             → str()
Decimal          → float()
ForeignKey       → _id サフィックスの生ID値（field.attname使用）
list / dict      → 再帰的に変換
```

### AuditAction 定数

```python
class AuditAction:
    LIST            = "list"
    RETRIEVE        = "retrieve"
    CREATE          = "create"
    UPDATE          = "update"
    PARTIAL_UPDATE  = "partial_update"
    SOFT_DELETE     = "soft_delete"
    FORCE_DELETE    = "force_delete"
    RESTORE         = "restore"
    LOGIN           = "login"
    LOGIN_FAILED    = "login_failed"
    LOGOUT          = "logout"
    LOGOUT_FAILED   = "logout_failed"
    TOKEN_REFRESH   = "token_refresh"
    TOKEN_REFRESH_FAILED = "token_refresh_failed"
    ME              = "me"
    PASSWORD_UPDATE = "password_update"
    ADMIN_PASSWORD_UPDATE = "admin_password_update"
    SERVER_ERROR    = "server_error"
```

---

## 10. OpenAPI共通関数

**場所**：`apps/common/openapi/openapi.py`

drf-spectacular のスキーマ定義を簡略化するユーティリティ関数。

### success_schema()

`success_response` の形式に合わせたスキーマを生成。

```python
success_schema("LoginResponse")
# → {"success": bool, "message": str, "data": null, "errors": null}

success_schema("MeResponse", data_fields={
    "user": MeSerializer(),
    "permissions": s.ListField(),
})
# → {"success": bool, "message": str, "data": {"user": {...}, "permissions": [...]}, "errors": null}
```

### error_schema()

`error_response` の形式に合わせたスキーマを生成。

```python
error_schema("LoginForbidden")
# → {"success": bool, "message": str, "data": null, "errors": dict}

error_schema("LoginValidationError", errors_fields={
    "username": s.ListField(),
    "password": s.ListField(),
})
```

### paginated_schema()

一覧（ページネーション）レスポンス用スキーマ。

```python
paginated_schema("UserList", UserListSerializer())
# → {"success": bool, "message": str, "data": {"items": [...], "pagination": {...}}, "errors": null}
```

### retrieve_schema()

詳細取得の統一成功レスポンス用。指定した Serializer の JSON を `data` に埋め込む。

```python
retrieve_schema("UserDetail", UserDetailSerializer())
```

### base_responses()

`BaseModelViewSet` 用の全actionレスポンスをまとめて生成。

```python
_r = base_responses(
    prefix="User",                          # スキーマ名の重複防止prefix
    list_serializer=UserListSerializer,     # 省略時はDRFが自動解決
    retrieve_serializer=UserDetailSerializer,
    create_serializer=UserDetailSerializer,
    update_serializer=UserDetailSerializer,
)

# 使用
responses=_r["list"]           # {200: paginated_schema, 403: error_schema}
responses=_r["retrieve"]       # {200: retrieve_schema, 403: ..., 404: ...}
responses=_r["create"]         # {201: serializer_success_schema, 400: ..., 403: ...}
responses=_r["update"]         # {200: serializer_success_schema, 400: ..., 403: ..., 404: ...}
responses=_r["partial_update"] # {200: serializer_success_schema, 400: ..., 403: ..., 404: ...}
responses=_r["destroy"]        # {200: success_schema, 403: ..., 404: ...}
responses=_r["force_destroy"]  # {200: ..., 400: ..., 403: ..., 404: ...}
responses=_r["restore"]        # {200: ..., 400: ..., 403: ..., 404: ...}
```

### readonly_responses()

`BaseReadOnlyModelViewSet` 用。`list` / `retrieve` のみ。

```python
_r = readonly_responses(
    prefix="AuditLog",
    list_serializer=AuditLogListSerializer,
    retrieve_serializer=AuditLogDetailSerializer,
)

responses=_r["list"]      # {200: paginated_schema, 403: error_schema}
responses=_r["retrieve"]  # {200: retrieve_schema, 403: ..., 404: ...}
```

---

## 11. レスポンス形式

**場所**：`apps/common/responses.py`

全APIレスポンスは以下の形式に統一。

標準 CRUD、カスタム action、専用 API を含むすべての成功レスポンスでこの形式を使用する。詳細取得・作成・更新では、Serializer の JSON を `data` に格納する。作成だけは HTTP 201、それ以外の通常成功時は原則 HTTP 200 を返す。

### success_response()

```python
return success_response(
    message="処理が完了しました。",
    data={"key": "value"},          # optional
    status_code=status.HTTP_200_OK, # optional
)
```

レスポンス：
```json
{
    "success": true,
    "message": "処理が完了しました。",
    "data": {"key": "value"},
    "errors": null
}
```

### error_response()

```python
return error_response(
    message="入力エラーが発生しました。",
    errors={"field": ["エラーメッセージ"]}, # optional
    status_code=status.HTTP_400_BAD_REQUEST,
)
```

レスポンス：
```json
{
    "success": false,
    "message": "入力エラーが発生しました。",
    "data": null,
    "errors": {"field": ["エラーメッセージ"]}
}
```

### ページネーション形式

`CustomPagination` により一覧は以下の形式で返る：

```json
{
    "success": true,
    "message": "",
    "data": {
        "items": [...],
        "pagination": {
            "count": 100,
            "next": "http://...?page=2",
            "previous": null,
            "page": 1,
            "page_size": 20
        }
    },
    "errors": null
}
```

---

## 12. 例外ハンドリング

**場所**：`apps/common/exceptions.py`

`settings.py` の `EXCEPTION_HANDLER` に設定。

```python
REST_FRAMEWORK = {
    "EXCEPTION_HANDLER": "apps.common.exceptions.custom_exception_handler",
}
```

DRFの全例外を `error_response()` 形式に変換して返す。
サーバーエラー（500）は `AuditService` にエラーログを記録する。

### 認証エラー（CookieJWTAuthentication）

`access_token` Cookie が存在しない場合は `None` を返す（認証スキップ）。
`access_token` が存在するが期限切れの場合は `AuthenticationFailed` を発生させる。

**注意**：期限切れのCookieがブラウザに残っている場合、全エンドポイントが401になる。
ブラウザのCookieをクリアすることで解消する。

---

## 13. 環境別セキュリティ設定

`backend/config/settings.py` は `ENVIRONMENT` により、次の3環境を切り替える。

| 環境 | 用途 | `DEBUG` | HTTPS |
|---|---|---:|---:|
| `development` | ローカル開発 | 環境変数に従う | 任意 |
| `internal` | 社内運用試験 | 常に`false` | 任意 |
| `production` | 本番運用 | 常に`false` | 必須 |

- `internal` と `production` では、`SECRET_KEY`、`ALLOWED_HOSTS`、`CORS_ALLOWED_ORIGINS`、`CSRF_TRUSTED_ORIGINS` を必須とする。
- `production` では、Secure Cookie、HTTPSリダイレクト、HSTS、リバースプロキシのHTTPS判定を常に有効化する。
- `internal` で `ENABLE_HTTPS_SECURITY=true` を指定すると、本番相当のHTTPS設定を先行検証できる。
- 未定義の環境名は、安全のため起動時に `ImproperlyConfigured` とする。

具体的な設定値、移行、検証、切戻しは `ENVIRONMENT_TRANSITION_GUIDE.md` を参照する。

---

## 14. ユーザー管理の安全制御

`apps/users/` は、初期管理者作成後のユーザー登録・更新・利用停止・論理削除・復元・管理者によるパスワード再設定を提供する。

- 作成・更新時は `role` から `is_staff` を自動設定し、`admin` だけを `is_staff=true` とする。
- 自分自身の降格・停止・論理削除を拒否する。
- 最後の有効な管理者の降格・停止・論理削除を拒否する。
- ユーザーの論理削除時は `is_active=false` も設定し、認証を停止する。
- 復元時は `is_active=false` を維持し、管理者の確認後に明示的な更新で利用再開する。
- 管理者用パスワード再設定APIで自分自身を対象にすることは禁止し、本人は現在のパスワードを確認する `/users/me/password/` を使用する。
- パスワードはDjangoのパスワードバリデーターで検証する。
- 物理削除APIは共通基盤との互換性のため存在するが、通常の管理画面では操作を提供しない。

ユーザー一覧は `is_active`、`role`、`search`、`only_deleted=true` を使用して、利用中・停止中・削除済みを取得する。
