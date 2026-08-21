import { House, Settings, Users } from "lucide-react";

import type { NavigationItem } from "@/components/layout/types";

/** プロジェクト固有の画面遷移を定義する。設定・ログアウトは共通レイアウトが提供する。 */
export const appNavigationItems: NavigationItem[] = [
  {
    type: "link",
    label: "ホーム",
    href: "/",
    icon: House,
    showInMobileBottom: true,
  },
  {
    type: "group",
    label: "管理",
    icon: Settings,
    requiredRole: "admin",
    children: [
      {
        type: "link",
        label: "ユーザー管理",
        href: "/admin/users",
        icon: Users,
        requiredRole: "admin",
      },
    ],
  },
];
