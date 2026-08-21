import type { ButtonHTMLAttributes } from "react";

type TabItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type TabsProps = {
  ariaLabel: string;
  items: readonly TabItem[];
  value: string;
  className?: string;
  onValueChange: (value: string) => void;
};

const BASE_TAB_CLASS_NAME =
  "min-w-0 rounded-control border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * ボタン形式の制御タブ。
 * レイアウトは呼び出し側の className で指定し、画面固有のレスポンシブ判断を持ち込まない。
 */
export function Tabs({
  ariaLabel,
  items,
  value,
  className,
  onValueChange,
}: TabsProps) {
  return (
    <div
      aria-label={ariaLabel}
      className={["grid gap-2", className].filter(Boolean).join(" ")}
      role="tablist"
    >
      {items.map((item) => {
        const isSelected = item.value === value;

        return (
          <TabButton
            key={item.value}
            aria-selected={isSelected}
            disabled={item.disabled}
            isSelected={isSelected}
            role="tab"
            onClick={() => onValueChange(item.value)}
          >
            {item.label}
          </TabButton>
        );
      })}
    </div>
  );
}

type TabButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isSelected: boolean;
};

function TabButton({
  children,
  className,
  isSelected,
  type = "button",
  ...props
}: TabButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        BASE_TAB_CLASS_NAME,
        isSelected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-text hover:bg-surface-muted",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}
