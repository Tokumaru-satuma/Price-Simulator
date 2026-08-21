import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordChangeFormProps = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onNewPasswordConfirmChange: (value: string) => void;
  onSubmit: () => void;
};

/** パスワード変更の入力欄だけを担う表示コンポーネント。 */
export function PasswordChangeForm({
  currentPassword,
  newPassword,
  newPasswordConfirm,
  errorMessage,
  isSubmitting,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onNewPasswordConfirmChange,
  onSubmit,
}: PasswordChangeFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-md">
      <Input
        label="現在のパスワード"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => onCurrentPasswordChange(event.target.value)}
        disabled={isSubmitting}
        required
      />
      <Input
        label="新しいパスワード"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => onNewPasswordChange(event.target.value)}
        disabled={isSubmitting}
        required
      />
      <Input
        label="新しいパスワード（確認）"
        type="password"
        autoComplete="new-password"
        value={newPasswordConfirm}
        onChange={(event) => onNewPasswordConfirmChange(event.target.value)}
        disabled={isSubmitting}
        required
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        変更内容を確認
      </Button>
    </form>
  );
}
