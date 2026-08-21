import { notFound } from "next/navigation";

import { UiPreviewScreen } from "@/features/ui-preview/components/ui-preview-screen";

/** 共通 UI の確認用ページ。本番環境では公開しない。 */
export default function UiPreviewPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <UiPreviewScreen />;
}
