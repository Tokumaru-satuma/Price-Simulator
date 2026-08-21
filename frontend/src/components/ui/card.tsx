import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

const BASE_CLASS_NAME =
  "rounded-dialog border border-border bg-surface p-stack-md shadow-card";

export function Card({ className, children, ...props }: CardProps) {
  const classes = [BASE_CLASS_NAME, className].filter(Boolean).join(" ");

  return (
    <div {...props} className={classes}>
      {children}
    </div>
  );
}
