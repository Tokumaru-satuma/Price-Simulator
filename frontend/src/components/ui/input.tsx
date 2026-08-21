import {
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: string;
  errorMessage?: string;
};

const BASE_CLASS_NAME =
  "w-full rounded-control border bg-surface px-control-x py-control-y text-text outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

/** ラベル・補足・入力エラーを扱う共通入力欄。 */
export function Input({
  id,
  label,
  hint,
  errorMessage,
  required,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
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
          htmlFor={inputId}
          className="mb-stack-xs block text-sm font-medium text-text"
        >
          {label}
          {required && (
            <span aria-hidden="true" className="text-danger">
              {" "}*
            </span>
          )}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        required={required}
        aria-invalid={hasError || ariaInvalid}
        aria-describedby={describedBy || undefined}
        className={classes}
      />

      {hint && !hasError && (
        <p id={hintId} className="mt-stack-xs text-sm text-text-muted">
          {hint}
        </p>
      )}

      {hasError && (
        <p id={errorId} role="alert" className="mt-stack-xs text-sm text-danger">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
