// API で起きたエラーをフロント全体で同じ形にそろえる

import type { ApiFieldErrors } from "./types";

type ApiErrorOptions = {
  status: number;
  message: string;
  errors?: ApiFieldErrors | null;
};

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiFieldErrors | null;

  constructor({ status, message, errors = null }: ApiErrorOptions) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * DRF の ValidationError 形式をたどり、最初に見つかった利用者向け文言を返す。
 * errors はフィールド別エラー表示にも使うため、加工せず ApiError に保持する。
 */
function findErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  // get_full_details() は { message, code } の形式を返すため、code より先に読む。
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  for (const [key, nestedValue] of Object.entries(record)) {
    if (key === "message" || key === "code") {
      continue;
    }

    const message = findErrorMessage(nestedValue);

    if (message) {
      return message;
    }
  }

  return null;
}

/** 外側の汎用 message より、errors 内の具体的な入力・業務エラーを優先する。 */
export function getApiErrorMessage(
  fallbackMessage: string,
  errors?: ApiFieldErrors | null,
): string {
  return findErrorMessage(errors) ?? fallbackMessage;
}
