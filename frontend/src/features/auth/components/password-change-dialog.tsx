"use client";

import {
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { usePasswordChangeForm } from "../hooks/use-password-change-form";
import { PasswordChangeForm } from "./password-change-form";

type PasswordChangeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

/** パスワード入力・確認・更新を接続する画面コンテナ。 */
export function PasswordChangeDialog({
  isOpen,
  onClose,
  onSuccess,
}: PasswordChangeDialogProps) {
  const titleId = useId();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const form = usePasswordChangeForm({
    onSuccess: (message) => {
      setIsConfirmationOpen(false);
      onClose();
      onSuccess(message);
    },
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  function closeDialog() {
    if (form.isSubmitting) {
      return;
    }

    setIsConfirmationOpen(false);
    form.reset();
    onClose();
  }

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  function requestConfirmation() {
    if (form.validateInputs()) {
      setIsConfirmationOpen(true);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-page"
        onMouseDown={handleBackdropMouseDown}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="w-full max-w-md rounded-dialog border border-border bg-surface p-stack-xl shadow-dialog"
        >
          <h2 id={titleId} className="text-lg font-semibold text-text">
            パスワードを変更
          </h2>
          <p className="mt-stack-sm text-sm text-text-muted">
            現在のパスワードを確認してから、新しいパスワードへ変更します。
          </p>

          <div className="mt-stack-xl">
            <PasswordChangeForm
              currentPassword={form.currentPassword}
              newPassword={form.newPassword}
              newPasswordConfirm={form.newPasswordConfirm}
              errorMessage={form.errorMessage}
              isSubmitting={form.isSubmitting}
              onCurrentPasswordChange={form.setCurrentPassword}
              onNewPasswordChange={form.setNewPassword}
              onNewPasswordConfirmChange={form.setNewPasswordConfirm}
              onSubmit={requestConfirmation}
            />
            <Button
              variant="secondary"
              className="mt-stack-sm w-full"
              disabled={form.isSubmitting}
              onClick={closeDialog}
            >
              キャンセル
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        isOpen={isConfirmationOpen}
        title="パスワードを変更しますか？"
        description="変更後は、新しいパスワードでログインしてください。"
        confirmLabel="変更する"
        isConfirming={form.isSubmitting}
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => {
          void form.submit();
        }}
      />
    </>
  );
}
