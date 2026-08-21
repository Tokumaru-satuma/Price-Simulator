import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { defaultThemeSettings } from "@/config/theme";
import { ThemeScript } from "@/features/theme/theme-script";

import { AppProviders } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "車両管理",
  description: "車両の運転記録・点検・整備・月報を管理するアプリケーション",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ja"
      data-theme={defaultThemeSettings.theme}
      data-mode={defaultThemeSettings.mode}
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeScript />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
