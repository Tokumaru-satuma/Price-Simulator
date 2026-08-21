"use client";

import { useState, type PointerEvent } from "react";

type SidebarResizeHandleProps = {
  isCollapsed: boolean;
  sidebarWidth: number;
  minExpandedWidth: number;
  maxWidth: number;
  collapsedWidth: number;
  onResize: (nextWidth: number) => void;
};

/** デスクトップ用サイドバーの幅をポインター・キーボードで変更するハンドル。 */
export function SidebarResizeHandle({
  isCollapsed,
  sidebarWidth,
  minExpandedWidth,
  maxWidth,
  collapsedWidth,
  onResize,
}: SidebarResizeHandleProps) {
  const [isResizing, setIsResizing] = useState(false);
  const currentWidth = isCollapsed ? collapsedWidth : sidebarWidth;

  function resize(clientX: number) {
    const nextWidth = Math.min(Math.max(clientX, collapsedWidth), maxWidth);
    onResize(nextWidth < minExpandedWidth ? collapsedWidth : nextWidth);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
    resize(event.clientX);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isResizing) {
      return;
    }

    resize(event.clientX);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsResizing(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const step = 16;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onResize(
        currentWidth - step < minExpandedWidth
          ? collapsedWidth
          : currentWidth - step,
      );
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      onResize(Math.min(currentWidth + step, maxWidth));
    }
  }

  return (
    <div
      role="separator"
      aria-label="サイドメニューの幅を変更"
      aria-orientation="vertical"
      aria-valuemin={collapsedWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={currentWidth}
      tabIndex={0}
      className={[
        "absolute inset-y-0 -right-1 z-40 hidden w-2 touch-none cursor-col-resize lg:block",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-transparent after:transition-colors",
        "hover:after:bg-primary focus-visible:outline-none focus-visible:after:bg-primary",
        isResizing && "after:bg-primary",
      ]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
    />
  );
}
