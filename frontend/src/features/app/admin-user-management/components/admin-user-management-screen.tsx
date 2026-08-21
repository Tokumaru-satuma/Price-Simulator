"use client";

import { useState } from "react";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { useToast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { LoadMoreButton } from "@/components/ui/load-more-button";
import { Select } from "@/components/ui/select";
import { useCurrentSession } from "@/features/auth/queries";
import type { UserRole } from "@/features/auth/types";
import { ApiError } from "@/lib/api/error";
import { flattenPaginatedItems, getPaginatedTotalCount } from "@/lib/api/pagination";

import { useDeleteAdminUser, useResetAdminUserPassword, useRestoreAdminUser, useSaveAdminUser, useSetAdminUserActive } from "../mutations";
import { useAdminUsers } from "../queries";
import type { AdminUser, CreateUserPayload, UpdateUserPayload, UserListFilters } from "../types";
import { PasswordResetDialog } from "./password-reset-dialog";
import { UserFormDialog } from "./user-form-dialog";

type ConfirmAction = { type: "delete" | "restore" | "activate" | "deactivate"; user: AdminUser } | null;

export function AdminUserManagementScreen() {
  const { showToast } = useToast();
  const sessionQuery = useCurrentSession();
  const canView = sessionQuery.data?.permissions.is_admin === true;
  const currentUserUuid = sessionQuery.data?.user.uuid;
  const [filters, setFilters] = useState<UserListFilters>({ status: "active", role: "", search: "" });
  const usersQuery = useAdminUsers(filters, canView);
  const saveMutation = useSaveAdminUser();
  const activeMutation = useSetAdminUserActive();
  const deleteMutation = useDeleteAdminUser();
  const restoreMutation = useRestoreAdminUser();
  const passwordMutation = useResetAdminUserPassword();
  const [formUser, setFormUser] = useState<AdminUser | null | undefined>(undefined);
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  if (sessionQuery.isPending || (canView && usersQuery.isPending)) return <LoadingState message="ユーザー管理を読み込んでいます..." />;
  if (sessionQuery.isError || (canView && usersQuery.isError)) return <ErrorState title="ユーザー管理を取得できませんでした" message="通信状況を確認して、再試行してください。" onRetry={() => void Promise.all([sessionQuery.refetch(), usersQuery.refetch()])} />;
  if (!canView) return <main className="mx-auto w-full max-w-6xl"><Card><h1 className="text-lg font-semibold text-text">ユーザー管理</h1><p className="mt-3 text-sm text-text-muted">この画面は管理者のみが使用できます。</p></Card></main>;

  const users = flattenPaginatedItems(usersQuery.data?.pages);
  const actionMutation = confirmAction?.type === "delete" ? deleteMutation : confirmAction?.type === "restore" ? restoreMutation : activeMutation;

  function closeForm() { setFormUser(undefined); saveMutation.reset(); }
  function executeConfirm() {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    const options = { onSuccess: () => { showToast(actionSuccessMessage(type)); setConfirmAction(null); } };
    if (type === "delete") deleteMutation.mutate(user.uuid, options);
    else if (type === "restore") restoreMutation.mutate(user.uuid, options);
    else activeMutation.mutate({ uuid: user.uuid, isActive: type === "activate" }, options);
  }

  return <main className="mx-auto w-full max-w-6xl space-y-6 lg:space-y-8">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-semibold text-text">ユーザー管理</h1><p className="mt-2 text-sm text-text-muted">ユーザーの登録、権限、利用状態、パスワードを管理します。</p></div><Button onClick={() => setFormUser(null)}>ユーザーを登録</Button></div>
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]"><Input label="検索" placeholder="氏名・ログインID・メール" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} /><Select label="状態" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as UserListFilters["status"] }))}><option value="active">利用中</option><option value="inactive">停止中</option><option value="deleted">削除済み</option></Select><Select label="権限" value={filters.role} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value as UserRole | "" }))}><option value="">すべて</option><option value="admin">管理者</option><option value="editor">登録ユーザー</option><option value="viewer">閲覧ユーザー</option></Select></div>
    {users.length === 0 ? <Card><p className="text-sm text-text-muted">該当するユーザーはありません。</p></Card> : <><UserTable users={users} currentUserUuid={currentUserUuid} onEdit={(user) => setFormUser(user)} onPassword={setPasswordUser} onAction={(type, user) => setConfirmAction({ type, user })} /><UserCards users={users} currentUserUuid={currentUserUuid} onEdit={(user) => setFormUser(user)} onPassword={setPasswordUser} onAction={(type, user) => setConfirmAction({ type, user })} /><LoadMoreButton loadedCount={users.length} totalCount={getPaginatedTotalCount(usersQuery.data?.pages)} hasNextPage={usersQuery.hasNextPage} isLoading={usersQuery.isFetchingNextPage} isError={usersQuery.isFetchNextPageError} onLoadMore={() => void usersQuery.fetchNextPage()} /></>}
    {formUser !== undefined && <UserFormDialog user={formUser} isOpen isSaving={saveMutation.isPending} errorMessage={errorMessage(saveMutation.error)} onClose={closeForm} onSubmit={(payload) => saveMutation.mutate(formUser ? { uuid: formUser.uuid, payload: payload as UpdateUserPayload } : { uuid: null, payload: payload as CreateUserPayload }, { onSuccess: () => { showToast(formUser ? "ユーザーを更新しました。" : "ユーザーを登録しました。"); closeForm(); } })} />}
    {passwordUser && <PasswordResetDialog user={passwordUser} isSaving={passwordMutation.isPending} errorMessage={errorMessage(passwordMutation.error)} onClose={() => { setPasswordUser(null); passwordMutation.reset(); }} onSubmit={(password) => passwordMutation.mutate({ uuid: passwordUser.uuid, password }, { onSuccess: () => { showToast("パスワードを再設定しました。"); setPasswordUser(null); } })} />}
    <ConfirmDialog isOpen={confirmAction !== null} title={confirmTitle(confirmAction)} description={confirmDescription(confirmAction)} confirmLabel={confirmLabel(confirmAction)} variant={confirmAction?.type === "delete" ? "danger" : "primary"} isConfirming={actionMutation.isPending} errorMessage={errorMessage(actionMutation.error)} onCancel={() => { setConfirmAction(null); actionMutation.reset(); }} onConfirm={executeConfirm} />
  </main>;
}

type UserListProps = { users: AdminUser[]; currentUserUuid?: string; onEdit: (user: AdminUser) => void; onPassword: (user: AdminUser) => void; onAction: (type: NonNullable<ConfirmAction>["type"], user: AdminUser) => void };
function UserTable(props: UserListProps) { return <div className="hidden overflow-x-auto rounded-dialog border border-border bg-surface md:block"><table className="w-full text-left text-sm"><thead className="bg-surface-muted text-text-muted"><tr><th className="px-4 py-3">氏名</th><th className="px-4 py-3">ログインID</th><th className="px-4 py-3">権限</th><th className="px-4 py-3">状態</th><th className="px-4 py-3 text-right">操作</th></tr></thead><tbody>{props.users.map((user) => <tr key={user.uuid} className="border-t border-border"><td className="px-4 py-3"><p className="font-medium text-text">{user.name}{user.uuid === props.currentUserUuid ? "（自分）" : ""}</p><p className="text-xs text-text-muted">{user.email}</p></td><td className="px-4 py-3 text-text">{user.username}</td><td className="px-4 py-3 text-text">{user.role_label}</td><td className="px-4 py-3"><Status user={user} /></td><td className="px-4 py-3"><Actions {...props} user={user} /></td></tr>)}</tbody></table></div>; }
function UserCards(props: UserListProps) { return <div className="grid gap-3 md:hidden">{props.users.map((user) => <Card key={user.uuid}><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-text">{user.name}{user.uuid === props.currentUserUuid ? "（自分）" : ""}</p><p className="mt-1 text-sm text-text-muted">{user.username}／{user.role_label}</p><p className="mt-1 break-all text-sm text-text-muted">{user.email}</p></div><Status user={user} /></div><div className="mt-4"><Actions {...props} user={user} /></div></Card>)}</div>; }
function Status({ user }: { user: AdminUser }) { const label=user.is_deleted ? "削除済み" : user.is_active ? "利用中" : "停止中"; const color=user.is_deleted ? "bg-danger/10 text-danger" : user.is_active ? "bg-info/10 text-info" : "bg-surface-muted text-text-muted"; return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${color}`}>{label}</span>; }
function Actions({ user, currentUserUuid, onEdit, onPassword, onAction }: UserListProps & { user: AdminUser }) { const isSelf=user.uuid===currentUserUuid; if(user.is_deleted) return <div className="flex justify-end"><Button size="sm" onClick={() => onAction("restore", user)}>復元</Button></div>; return <div className="flex flex-wrap justify-end gap-2"><Button size="sm" variant="secondary" onClick={() => onEdit(user)}>編集</Button>{!isSelf && <Button size="sm" variant="secondary" onClick={() => onPassword(user)}>パスワード再設定</Button>}{!isSelf && <Button size="sm" variant="secondary" onClick={() => onAction(user.is_active ? "deactivate" : "activate", user)}>{user.is_active ? "利用停止" : "利用再開"}</Button>}{!isSelf && <Button size="sm" variant="danger" onClick={() => onAction("delete", user)}>削除</Button>}</div>; }
function errorMessage(error: unknown): string | null { return error instanceof ApiError ? error.message : null; }
function confirmTitle(action: ConfirmAction): string { if(!action) return "確認"; return action.type === "delete" ? "ユーザーを削除" : action.type === "restore" ? "ユーザーを復元" : action.type === "activate" ? "利用を再開" : "利用を停止"; }
function confirmLabel(action: ConfirmAction): string { if(!action) return "実行"; return action.type === "delete" ? "削除" : action.type === "restore" ? "復元" : action.type === "activate" ? "利用再開" : "利用停止"; }
function confirmDescription(action: ConfirmAction): string { if(!action) return ""; if(action.type === "restore") return `${action.user.name}を復元します。復元後も停止状態のため、必要に応じて利用再開してください。`; return `${action.user.name}の${confirmLabel(action)}を実行します。`; }
function actionSuccessMessage(type: NonNullable<ConfirmAction>["type"]): string { return type === "delete" ? "ユーザーを削除しました。" : type === "restore" ? "ユーザーを停止状態で復元しました。" : type === "activate" ? "ユーザーの利用を再開しました。" : "ユーザーの利用を停止しました。"; }
