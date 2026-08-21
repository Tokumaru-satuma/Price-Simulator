# django-project-template

Next.js と Django + DRF をベースにした社内プロジェクト共通テンプレート。

新規プロジェクト開始時は「Use this template」からリポジトリを作成する。

---

## 構成

```
backend/
├── apps/
│   ├── accounts/       # 認証（JWT Cookie認証）
│   ├── audit/          # 監査ログ
│   ├── common/         # 共通基盤
│   └── users/          # ユーザー管理
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── manage.py
├── requirements.txt
└── .env.example

frontend/
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # 共通UI・共通レイアウト
│   ├── features/       # 業務機能単位の実装
│   └── lib/            # APIクライアントなどの共通処理
├── package.json
└── package-lock.json
```

## アーキテクチャ文書

- [ARCHITECTURE.md](ARCHITECTURE.md): テンプレート全体の技術構成・依存関係の概要
- [BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md): Django／DRF共通基盤の詳細
- [FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md): Next.js共通基盤の詳細
- [ENVIRONMENT_TRANSITION_GUIDE.md](ENVIRONMENT_TRANSITION_GUIDE.md): development／internal／production の設定・移行・切戻し

業務アプリ固有の設計は `docs/project/` 配下で管理する。

---

## 共通基盤（apps/common）

### モデル

```
apps/common/models/
    base_model.py       # BaseModel（全モデルの基底クラス）
    managers.py         # ActiveManager（is_deleted=Falseフィルタ）
    querysets.py        # ActiveQuerySet
```

**BaseModel** が持つ共通フィールド：
```
uuid            UUIDField       論理キー（APIのlookup_fieldに使用）
created_at      DateTimeField   作成日時（auto）
created_by      FK(User)        作成者
updated_at      DateTimeField   更新日時（auto）
updated_by      FK(User)        更新者
is_deleted      BooleanField    論理削除フラグ
deleted_at      DateTimeField   論理削除日時
deleted_by      FK(User)        論理削除者
```

**ActiveManager**：`objects` として登録。`is_deleted=False` のみ返す。
**all_objects**：`models.Manager()` として登録。論理削除済みを含む全件返す。

---

### ViewSet

```
apps/common/viewsets/
    base_model_viewset.py           # CRUD + 論理削除 + 復元 + 完全削除
    base_read_only_model_viewset.py # 参照のみ
```

**BaseModelViewSet** の機能：
- `list` / `retrieve` / `create` / `update` / `partial_update`
- `destroy`：論理削除（`SoftDeleteMixin`）
- `restore`：論理削除からの復元（`RestoreMixin`）
- `force_destroy`：物理削除（`ForceDeleteMixin`）
- `get_all_object()`：論理削除済みを含む単一オブジェクト取得（restore/force_destroy用）
- `get_queryset()` で `?include_deleted=true` / `?only_deleted=true` をサポート（adminのみ）
- `serializer_action_classes` で action別にSerializerを切り替え可能
- `select_related_action_fields` / `prefetch_related_action_fields` でクエリ最適化

---

### Serializer

```
apps/common/serializers/
    base_model_serializer.py        # 共通フィールド定義
    base_list_serializer.py         # 一覧用（uuid/created_at/updated_at）
    base_detail_serializer.py       # 詳細用（+ created_by/updated_by/deleted系）
    base_create_update_serializer.py # 作成・更新用
    simple_user_serializer.py       # User簡易表示用
```

---

### Mixin

```
apps/common/mixins/
    crud_mixin.py           # CRUDMixin（以下のMixinをまとめたもの）
    logging_mixin.py        # AuditService連携
    exception_mixin.py      # 例外ハンドリング
    permission_mixin.py     # Role権限チェック
    response_mixin.py       # success/error レスポンス生成
    validation_mixin.py     # バリデーション
    soft_delete_mixin.py    # 論理削除
    restore_mixin.py        # 復元
    force_delete_mixin.py   # 物理削除
```

---

### 権限（Permission）

```
apps/common/permissions/
    roles.py            # Role定義（viewer/editor/admin）
    roles_permissions.py # IsViewer / IsEditor / IsAdmin
    base.py             # RolePermission基底クラス
    constants.py        # DEFAULT_PERMISSION_MAP_FOR_VIEWSET
    utils.py            # has_min_role / get_permissions_from_role
```

**Role階層**：
```
viewer(1) < editor(2) < admin(3)
```

ViewSetへの適用例：
```python
permission_classes = [IsAdmin]   # adminのみ
permission_classes = [IsEditor]  # editor以上
permission_classes = [IsViewer]  # viewer以上（全ユーザー）
```

---

### OpenAPI（drf-spectacular）

```
apps/common/openapi/
    openapi.py      # success_schema / error_schema / paginated_schema
                    # retrieve_schema / base_responses / readonly_responses
```

ViewSetでの使用例：
```python
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
)
class SomeViewSet(BaseModelViewSet):
    ...
```

---

### レスポンス形式

全APIレスポンスは以下の形式に統一：

```json
{
    "success": true,
    "message": "処理が完了しました。",
    "data": {},
    "errors": null
}
```

標準 CRUD、カスタム action、専用 API の成功レスポンスはすべてこの形式を使用する。
詳細取得・作成・更新の Serializer の JSON は `data` に格納する。HTTP ステータスは作成時のみ `201 Created`、それ以外の通常成功時は原則 `200 OK` とする。

一覧（ページネーション）：
```json
{
    "success": true,
    "message": "",
    "data": {
        "items": [],
        "pagination": {
            "count": 100,
            "next": "http://...",
            "previous": null,
            "page": 1,
            "page_size": 20
        }
    },
    "errors": null
}
```

---

### 監査ログ（apps/audit）

全API操作を `AuditLog` に記録する。

記録内容：
```
user / username / action / model_name / object_id
ip_address / user_agent / path / method / query_params
before_data / after_data / changed_fields
level / detail / traceback
```

`BaseModelViewSet` の `perform_create` / `perform_update` で自動記録。
`AuditService.get_instance_snapshot()` でモデルの状態をJSON安全な形式でスナップショット取得。

---

### 認証（apps/accounts）

JWT Cookie認証。`access_token` / `refresh_token` を HttpOnly Cookie で管理。

エンドポイント：
```
POST /accounts/login/    ログイン
POST /accounts/logout/   ログアウト
POST /accounts/refresh/  トークンリフレッシュ
GET  /accounts/me/       ログインユーザー情報取得
```

---

### ユーザー管理（apps/users）

```
GET/POST        /users/users/               一覧・作成
GET/PATCH/DELETE /users/users/{uuid}/       詳細・更新・論理削除
DELETE          /users/users/{uuid}/force/  物理削除
POST            /users/users/{uuid}/restore/ 復元
PATCH           /users/{uuid}/password/     パスワード変更（admin用）
GET/PATCH       /users/me/                  自分の情報取得・更新
PATCH           /users/me/password/         自分のパスワード変更
```

認証後の管理メニューから `/admin/users` を開くと、ユーザーの検索・権限／状態絞り込み、登録、編集、停止・再開、論理削除・復元、管理者によるパスワード再設定を行える。デスクトップは表、モバイルはカードで表示する。

- `role=admin` のときだけ `is_staff=true` とし、API入力から個別に指定しない。
- 自分自身と最後の有効な管理者は降格・停止・削除できない。
- 論理削除時はログインを停止し、復元後も停止状態を維持する。確認後に管理者が利用再開する。
- 自分自身のパスワードは、現在のパスワードを確認する個人設定から変更する。
- 物理削除は通常の管理画面では提供しない。

---

## 環境構築

```bash
# リポジトリをテンプレートから作成後
cp .env.example backend/.env
cd backend
# .env を編集（DB設定等）

python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

新規DBでは `createsuperuser` で最初の管理者を1人だけ作成し、以後の利用者登録は `/admin/users` から行う。

### VS Code / Pylance

VS Codeでは、実際に作成した仮想環境を `.vscode/settings.json` で明示する。テンプレート例の `venv` ではなく `.venv` を使う場合は、パスも同じ名前に合わせる。

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}\\backend\\venv\\Scripts\\python.exe",
  "python.analysis.extraPaths": [
    "${workspaceFolder}\\backend"
  ],
  "python-envs.defaultEnvManager": "ms-python.python:venv"
}
```

Pythonインタープリターの指定だけを目的に `pyrightconfig.json` を追加・維持しない。VS Code設定と重複すると、Pylanceが存在しない仮想環境を参照したり、プロジェクトごとに解析結果が異なったりする場合がある。特別な静的解析ルールが必要な場合だけ、実際の仮想環境名と一致する内容で `pyrightconfig.json` を管理する。

---

## 新規アプリ追加手順

```bash
python manage.py startapp appname apps/appname
```

`settings.py` に追加：
```python
INSTALLED_APPS = [
    ...
    "apps.appname",
]
```

`apps/appname/apps.py` を修正：
```python
class AppnameConfig(AppConfig):
    name = "apps.appname"
```

`config/urls.py` に追加：
```python
path("appname/", include("apps.appname.urls")),
```

---

## テンプレート更新手順

業務アプリで共通基盤を修正し、検証した場合にテンプレートへ同期する。

```powershell
xcopy C:\web_app\license-app\backend\apps\common C:\projects\django-template\backend\apps\common\ /E /Y
cd C:\projects\django-template
git add .
git commit -m "sync: 修正内容の概要"
git push
```

フロントエンド共通基盤を同期する場合は、`frontend/src/components/`、共通Provider・共通Hook・型定義など、変更対象だけを同期する。依存関係を変更した場合は `frontend/package.json` と `frontend/package-lock.json` も同期する。

Frontendのパッケージマネージャーはnpmとし、依存関係を復旧する場合は `frontend` で `npm ci` を実行する。

---

## 主な依存パッケージ

```
Django
djangorestframework
djangorestframework-simplejwt
drf-spectacular
django-filter
django-cors-headers
psycopg2
python-dotenv
```
