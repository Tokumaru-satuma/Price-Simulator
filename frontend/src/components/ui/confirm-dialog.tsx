"use client";

import { type ReactNode, useRef } from "react";

import { Button } from "./button";
import { Dialog } from "./dialog";

type ConfirmDialogVariant = "primary" | "danger";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  isConfirming?: boolean;
  isConfirmDisabled?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * 実行前の確認を求める共通ダイアログ。
 * 実際の業務処理と開閉状態は呼び出し側で管理する。
 */
export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = "キャンセル",
  variant = "primary",
  isConfirming = false,
  isConfirmDisabled = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      initialFocusRef={cancelButtonRef}
      isDismissable={!isConfirming}
      onClose={onCancel}
      footer={
        <>
          <Button
            ref={cancelButtonRef}
            variant="secondary"
            disabled={isConfirming}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant}
            disabled={isConfirmDisabled}
            isLoading={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description}

      {errorMessage && (
        <p
          role="alert"
          className="mt-stack-sm rounded-control border border-danger/30 bg-danger/5 px-control-x py-control-y text-sm text-danger"
        >
          {errorMessage}
        </p>
      )}
    </Dialog>
  );
}
