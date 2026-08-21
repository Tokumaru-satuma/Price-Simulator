"use client";

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 成功通知をアプリ内で共有する。 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message === null) {
      return;
    }

    const timerId = window.setTimeout(() => setMessage(null), 3000);

    return () => window.clearTimeout(timerId);
  }, [message]);

  const showToast = useCallback((nextMessage: string) => {
    setMessage(nextMessage);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {message !== null && (
        <p
          role="status"
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-card border border-success bg-surface px-stack-md py-stack-sm text-sm font-medium text-success shadow-card lg:left-[calc(50%+8rem)]"
        >
          {message}
        </p>
      )}
    </ToastContext.Provider>
  );
}

/** 成功通知を表示する。ToastProvider 配下で利用する。 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}
