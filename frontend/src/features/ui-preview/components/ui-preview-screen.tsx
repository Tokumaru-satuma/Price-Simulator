"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";

type DialogKind = "primary" | "danger" | null;

/** 開発時に共通 UI の状態と操作を確認するためのサンプル画面。 */
export function UiPreviewScreen() {
  const [textValue, setTextValue] = useState("");
  const [dialogKind, setDialogKind] = useState<DialogKind>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const isDialogOpen = dialogKind !== null;
  const isDangerDialog = dialogKind === "danger";

  function openDialog(kind: Exclude<DialogKind, null>) {
    setResultMessage(null);
    setDialogKind(kind);
  }

  function closeDialog() {
    if (!isConfirming) {
      setDialogKind(null);
    }
  }

  function handleConfirm() {
    setIsConfirming(true);

    window.setTimeout(() => {
      setResultMessage(
        isDangerDialog
          ? "削除処理を実行しました（確認用）。"
          : "保存処理を実行しました（確認用）。",
      );
      setIsConfirming(false);
      setDialogKind(null);
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-background p-page text-text">
      <div className="mx-auto max-w-3xl space-y-section">
        <header>
          <p className="text-sm font-medium text-primary">開発環境限定</p>
          <h1 className="mt-stack-xs text-3xl font-semibold">共通 UI プレビュー</h1>
          <p className="mt-stack-sm text-sm text-text-muted">
            Button、Input、ConfirmDialog の見た目と操作を確認できます。
          </p>
        </header>

        <section className="rounded-card border border-border bg-surface p-stack-xl shadow-card">
          <h2 className="text-lg font-semibold">Button</h2>

          <div className="mt-stack-md flex flex-wrap items-center gap-stack-sm">
            <Button>主要操作</Button>
            <Button variant="secondary">キャンセル</Button>
            <Button variant="danger">削除</Button>
            <Button variant="ghost">詳細</Button>
            <Button isLoading>処理中</Button>
            <Button disabled>無効</Button>
          </div>

          <div className="mt-stack-md flex flex-wrap items-center gap-stack-sm">
            <Button size="sm">小</Button>
            <Button size="md">標準</Button>
            <Button size="lg">大</Button>
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-stack-xl shadow-card">
          <h2 className="text-lg font-semibold">Input</h2>

          <div className="mt-stack-md grid gap-stack-md sm:grid-cols-2">
            <Input
              label="通常の入力欄"
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              placeholder="入力してください"
            />
            <Input
              label="補足付きの入力欄"
              type="number"
              hint="km単位で入力してください。"
              placeholder="例: 12000"
            />
            <Input
              label="エラー状態の入力欄"
              value=""
              errorMessage="この項目は必須です。"
              readOnly
              required
            />
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-stack-xl shadow-card">
          <h2 className="text-lg font-semibold">ConfirmDialog</h2>
          <p className="mt-stack-sm text-sm text-text-muted">
            Escape、背景クリック、Tab 移動、実行中状態を確認できます。
          </p>

          <div className="mt-stack-md flex flex-wrap gap-stack-sm">
            <Button onClick={() => openDialog("primary")}>保存を確認</Button>
            <Button variant="danger" onClick={() => openDialog("danger")}>
              削除を確認
            </Button>
          </div>

          {resultMessage && (
            <p role="status" className="mt-stack-md text-sm text-success">
              {resultMessage}
            </p>
          )}
        </section>
      </div>

      <ConfirmDialog
        isOpen={isDialogOpen}
        title={isDangerDialog ? "削除を実行しますか？" : "保存を実行しますか？"}
        description={
          isDangerDialog
            ? "この操作は確認用です。実際のデータは変更されません。"
            : "この操作は確認用です。実際のデータは保存されません。"
        }
        confirmLabel={isDangerDialog ? "削除する" : "保存する"}
        variant={isDangerDialog ? "danger" : "primary"}
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </main>
  );
}
