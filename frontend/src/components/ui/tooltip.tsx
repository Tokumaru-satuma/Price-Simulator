import { useId, type ReactNode } from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
};

/** アイコンのみの操作に補足名称を表示する共通Tooltip。 */
export function Tooltip({ content, children }: TooltipProps) {
  const tooltipId = useId();

  return (
    <span className="group relative inline-flex">
      <span aria-describedby={tooltipId}>{children}</span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 w-max -translate-y-1/2 rounded-control bg-text px-2 py-1 text-xs font-medium text-background opacity-0 shadow-dialog transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
