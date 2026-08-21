"use client";

import { useEffect, useState, type ReactNode } from "react";

type MobileCollapsibleHeaderProps = {
  leadingContent: ReactNode;
  toolbar: ReactNode;
  mobileStatus?: ReactNode;
};

const TOP_EXPAND_THRESHOLD_PX = 8;

/** モバイルでは補助操作を折りたたみ、主要操作を常時表示する共通ヘッダー。 */
export function MobileCollapsibleHeader({
  leadingContent,
  toolbar,
  mobileStatus,
}: MobileCollapsibleHeaderProps) {
  const isCollapsed = useMobileHeaderCollapsed();

  return (
    <div className="sticky -mx-page top-0 z-20 border-b border-border bg-background/95 px-page py-1 backdrop-blur lg:mx-0 lg:px-0 lg:py-2">
      <div className="grid gap-2 lg:grid-cols-[minmax(18rem,24rem)_1fr] lg:items-end lg:gap-4">
        <div
          className={[
            "overflow-hidden transition-[max-height,opacity,transform] duration-200 ease-out lg:max-h-none lg:translate-y-0 lg:opacity-100",
            isCollapsed
              ? "max-h-0 -translate-y-2 opacity-0"
              : "max-h-32 translate-y-0 opacity-100",
          ].join(" ")}
        >
          {leadingContent}
          {mobileStatus && (
            <div className="mt-2 flex justify-center lg:hidden">
              {mobileStatus}
            </div>
          )}
        </div>
        <div className="lg:justify-self-end">{toolbar}</div>
      </div>
    </div>
  );
}

function useMobileHeaderCollapsed(): boolean {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById("app-content-scroll");

    if (scrollContainer === null) {
      return;
    }

    const target = scrollContainer;

    function handleScroll() {
      setIsCollapsed(target.scrollTop > TOP_EXPAND_THRESHOLD_PX);
    }

    target.addEventListener("scroll", handleScroll, { passive: true });

    return () => target.removeEventListener("scroll", handleScroll);
  }, []);

  return isCollapsed;
}
