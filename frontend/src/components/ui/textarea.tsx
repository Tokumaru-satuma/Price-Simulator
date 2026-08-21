import { forwardRef, type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  errorMessage?: string;
};

/** ラベルとエラー表示を備えた共通テキストエリア。 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, errorMessage, id, className, ...props }, ref) {
    const textareaId = id ?? `textarea-${label}`;

    return (
      <label htmlFor={textareaId} className="block">
        <span className="mb-stack-xs block text-sm font-medium text-text">
          {label}
        </span>
        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          className={[
            "w-full rounded-control border border-border bg-surface px-control-x py-control-y text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30",
            errorMessage && "border-danger focus:border-danger focus:ring-danger/30",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {errorMessage && (
          <span role="alert" className="mt-stack-xs block text-sm text-danger">
            {errorMessage}
          </span>
        )}
      </label>
    );
  },
);

Textarea.displayName = "Textarea";
