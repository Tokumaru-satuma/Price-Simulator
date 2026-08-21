"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@/features/auth/types";

import type { AdminUser, CreateUserPayload, UpdateUserPayload } from "../types";

type FormValues = {
  username: string;
  email: string;
  name: string;
  role: UserRole;
  password: string;
  is_active: boolean;
};

type Props = {
  user: AdminUser | null;
  isOpen: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => void;
};

const FORM_ID = "admin-user-form";

export function UserFormDialog({ user, isOpen, isSaving, errorMessage, onClose, onSubmit }: Props) {
  const [values, setValues] = useState(() => createValues(user));
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  function update(key: string, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user && values.password !== passwordConfirm) {
      setValidationError("パスワードが一致しません。");
      return;
    }
    setValidationError(null);
    if (user) {
      onSubmit({
        username: values.username,
        email: values.email,
        name: values.name,
        role: values.role,
        is_active: values.is_active,
      });
    } else {
      onSubmit({
        username: values.username,
        email: values.email,
        name: values.name,
        role: values.role,
        password: values.password,
      });
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      title={user ? "ユーザーを編集" : "ユーザーを登録"}
      isDismissable={!isSaving}
      onClose={onClose}
      footer={<><Button variant="secondary" disabled={isSaving} onClick={onClose}>キャンセル</Button><Button form={FORM_ID} type="submit" isLoading={isSaving}>保存</Button></>}
    >
      <form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit}>
        <Input required label="ログインID" autoComplete="username" value={values.username} onChange={(event) => update("username", event.target.value)} />
        <Input required label="氏名" value={values.name} onChange={(event) => update("name", event.target.value)} />
        <Input required label="メールアドレス" type="email" value={values.email} onChange={(event) => update("email", event.target.value)} />
        <Select required label="権限" value={values.role} onChange={(event) => update("role", event.target.value as UserRole)}>
          <option value="viewer">閲覧ユーザー</option>
          <option value="editor">登録ユーザー</option>
          <option value="admin">管理者</option>
        </Select>
        {!user && <><Input required minLength={8} label="初期パスワード" type="password" autoComplete="new-password" value={values.password} onChange={(event) => update("password", event.target.value)} /><Input required minLength={8} label="初期パスワード（確認）" type="password" autoComplete="new-password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} /></>}
        {user && <label className="flex items-center gap-2 text-sm text-text"><input type="checkbox" checked={values.is_active} onChange={(event) => update("is_active", event.target.checked)} />利用を許可する</label>}
        {(validationError || errorMessage) && <p role="alert" className="text-sm text-danger">{validationError ?? errorMessage}</p>}
      </form>
    </Dialog>
  );
}

function createValues(user: AdminUser | null): FormValues {
  if (user) return { username: user.username, email: user.email, name: user.name, role: user.role, password: "", is_active: user.is_active };
  return { username: "", email: "", name: "", role: "editor", password: "", is_active: true };
}
