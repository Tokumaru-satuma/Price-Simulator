import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { Button, type ButtonSize, type ButtonVariant } from "./button";

type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  icon: ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  sm: "!size-8 !p-0",
  md: "!size-10 !p-0",
  lg: "!size-12 !p-0",
};

/**
 * アイコンだけで操作を表す共通ボタン。
 * label を必須にして、支援技術とホバー時の説明を必ず提供する。
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      label,
      size = "sm",
      isLoading = false,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <Button
        {...props}
        ref={ref}
        aria-label={label}
        className={[SIZE_CLASS_NAMES[size], className]
          .filter(Boolean)
          .join(" ")}
        isLoading={isLoading}
        size={size}
        title={label}
      >
        {!isLoading && icon}
      </Button>
    );
  },
);

IconButton.displayName = "IconButton";
