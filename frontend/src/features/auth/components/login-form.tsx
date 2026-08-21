import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormProps = {
  username: string;
  password: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

/** ユーザー名とパスワードを入力する表示専用のフォーム。 */
export function LoginForm({
  username,
  password,
  errorMessage,
  isSubmitting,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: LoginFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-stack-md">
      <Input
        id="username"
        label="ユーザー名"
        name="username"
        type="text"
        autoComplete="username"
        value={username}
        onChange={(event) => onUsernameChange(event.target.value)}
        disabled={isSubmitting}
        required
      />

      <Input
        id="password"
        label="パスワード"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        disabled={isSubmitting}
        required
      />

      {errorMessage && (
        <p role="alert" className="text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        ログイン
      </Button>
    </form>
  );
}
