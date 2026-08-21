import { LayoutGrid, Table } from "lucide-react";

import { IconButton } from "./icon-button";
import { Tooltip } from "./tooltip";

export type ListViewMode = "card" | "table";

type ListViewModeToggleProps = {
  value: ListViewMode;
  className?: string;
  onValueChange: (value: ListViewMode) => void;
};

/** デスクトップ一覧のカード・表表示を切り替えるセグメントトグル。 */
export function ListViewModeToggle({
  value,
  className,
  onValueChange,
}: ListViewModeToggleProps) {
  return (
    <div
      aria-label="一覧の表示形式"
      className={[
        "inline-flex items-center gap-1 rounded-control border border-border bg-surface p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="group"
    >
      <Tooltip content="カード形式">
        <IconButton
          aria-pressed={value === "card"}
          icon={<LayoutGrid aria-hidden="true" className="size-4" />}
          label="カード形式"
          variant={value === "card" ? "primary" : "ghost"}
          onClick={() => onValueChange("card")}
        />
      </Tooltip>
      <Tooltip content="表形式">
        <IconButton
          aria-pressed={value === "table"}
          icon={<Table aria-hidden="true" className="size-4" />}
          label="表形式"
          variant={value === "table" ? "primary" : "ghost"}
          onClick={() => onValueChange("table")}
        />
      </Tooltip>
    </div>
  );
}
