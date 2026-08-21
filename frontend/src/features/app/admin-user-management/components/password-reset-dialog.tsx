"use client";

import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { AdminUser } from "../types";

type Props = { user: AdminUser | null; isSaving: boolean; errorMessage: string | null; onClose: () => void; onSubmit: (password: string) => void };
const FORM_ID = "admin-user-password-reset-form";

export function PasswordResetDialog({ user, isSaving, errorMessage, onClose, onSubmit }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { setValidationError("パスワードが一致しません。"); return; }
    setValidationError(null); onSubmit(password);
  }

  return <Dialog isOpen={user !== null} title={`${user?.name ?? "ユーザー"}のパスワード再設定`} isDismissable={!isSaving} onClose={onClose} footer={<><Button variant="secondary" disabled={isSaving} onClick={onClose}>キャンセル</Button><Button form={FORM_ID} type="submit" isLoading={isSaving}>再設定</Button></>}><form id={FORM_ID} className="space-y-4" onSubmit={handleSubmit}><Input required minLength={8} label="新しいパスワード" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /><Input required minLength={8} label="新しいパスワード（確認）" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />{(validationError || errorMessage) && <p role="alert" className="text-sm text-danger">{validationError ?? errorMessage}</p>}</form></Dialog>;
}
