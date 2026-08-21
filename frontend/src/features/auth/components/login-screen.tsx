"use client";

import { useRouter } from "next/navigation";

import { useLoginForm } from "../hooks/use-login-form";
import { getSafeNextPath } from "../utils";
import { LoginForm } from "./login-form";

type LoginScreenProps = {
  nextPath?: string;
};

/** ログインフォームのロジックと表示を接続し、成功後の画面遷移を担う。 */
export function LoginScreen({ nextPath }: LoginScreenProps) {
  const router = useRouter();
  const destination = getSafeNextPath(nextPath);

  const form = useLoginForm({
    onSuccess: () => {
      router.replace(destination);
    },
  });

  return (
    <main className="grid min-h-screen place-items-center bg-background p-page">
      <section className="w-full max-w-md rounded-dialog border border-border bg-surface p-stack-xl shadow-card">
        <p className="text-sm font-medium text-primary">車両管理</p>
        <h1 className="mt-stack-xs text-2xl font-semibold text-text">
          ログイン
        </h1>

        <div className="mt-stack-xl">
          <LoginForm
            username={form.username}
            password={form.password}
            errorMessage={form.errorMessage}
            isSubmitting={form.isSubmitting}
            onUsernameChange={form.setUsername}
            onPasswordChange={form.setPassword}
            onSubmit={form.submit}
          />
        </div>
      </section>
    </main>
  );
}
