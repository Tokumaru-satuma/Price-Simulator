import { type ReactNode, type SelectHTMLAttributes, useId } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  hint?: string;
  errorMessage?: string;
};

const BASE_CLASS_NAME =
  "w-full rounded-control border bg-surface px-control-x py-control-y text-text outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

/**
 * ラベル・補足・入力エラーを扱う共通セレクトボックス。
 */
export function Select({
  id,
  label,
  hint,
  errorMessage,
  required,
  className,
  children,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;
  const errorId = `${selectId}-error`;
  const hasError = Boolean(errorMessage);

  const describedBy = [
    ariaDescribedBy,
    hint ? hintId : undefined,
    hasError ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const stateClassName = hasError
    ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/30"
    : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30";

  const classes = [BASE_CLASS_NAME, stateClassName, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-stack-xs block text-sm font-medium text-text"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              {" "}
              *
            </span>
          )}
        </label>
      )}

      <select
        {...props}
        id={selectId}
        required={required}
        aria-invalid={hasError || ariaInvalid}
        aria-describedby={describedBy || undefined}
        className={classes}
      >
        {children}
      </select>

      {hint && !hasError && (
        <p id={hintId} className="mt-stack-xs text-sm text-text-muted">
          {hint}
        </p>
      )}

      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="mt-stack-xs text-sm text-danger"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
