import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const BASE_CLASS_NAME =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "border border-border bg-surface-muted text-text hover:bg-surface",
  danger: "bg-danger text-danger-foreground hover:bg-danger-hover",
  ghost: "bg-transparent text-text hover:bg-surface-muted",
};

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-control-x py-control-y text-sm",
  lg: "px-5 py-3 text-base",
};

/**
 * 共通ボタン。
 * type の既定値は button とし、意図しないフォーム送信を防ぐ。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      type = "button",
      className,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || isLoading;

    const classes = [
      BASE_CLASS_NAME,
      VARIANT_CLASS_NAMES[variant],
      SIZE_CLASS_NAMES[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={classes}
      >
        {isLoading && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
