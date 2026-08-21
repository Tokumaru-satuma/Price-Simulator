"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { ToastProvider } from "@/components/feedback/toast";
import { ThemeProvider } from "@/features/theme/theme-provider";
import { ApiError } from "@/lib/api/error";

type AppProvidersProps = {
  children: ReactNode;
};

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    const isClientError = error.status >= 400 && error.status < 500;

    if (isClientError) {
      return false;
    }
  }

  // failureCount=0 の最初の失敗時だけ true にするため、最大1回再試行する。
  return failureCount < 1;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetryQuery,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
