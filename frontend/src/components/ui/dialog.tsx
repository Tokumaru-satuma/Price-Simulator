"use client";

import {
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isDismissable?: boolean;
  onClose: () => void;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/**
 * 背景クリック・Escape・フォーカストラップを扱う共通ダイアログ。
 * 内容とフッターの表示、開閉状態は呼び出し側で管理する。
 */
export function Dialog({
  isOpen,
  title,
  children,
  footer,
  initialFocusRef,
  isDismissable = true,
  onClose,
}: DialogProps) {
  const titleId = useId();
  const contentId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    const firstFocusableElement = dialogRef.current?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    (initialFocusRef?.current ?? firstFocusableElement)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [initialFocusRef, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isDismissable) {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ) ?? [],
      );

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDismissable, isOpen, onClose]);

  function handleBackdropMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (isDismissable && event.target === event.currentTarget) {
      onClose();
    }
  }

  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-page"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={contentId}
        className="flex max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-dialog border border-border bg-surface p-stack-xl shadow-dialog"
      >
        <h2 id={titleId} className="text-lg font-semibold text-text">
          {title}
        </h2>

        <div
          id={contentId}
          className="mt-stack-sm min-h-0 flex-1 overflow-y-auto pr-1 text-sm text-text-muted"
        >
          {children}
        </div>

        {footer && (
          <div className="mt-stack-xl flex shrink-0 justify-end gap-stack-sm">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
