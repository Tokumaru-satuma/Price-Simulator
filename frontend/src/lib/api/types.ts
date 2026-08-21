// レスポンスの型定義

export type ApiFieldErrors = Record<string, unknown>;

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
  errors: null;
};

export type ApiFailure = {
  success: false;
  message: string;
  data: null;
  errors: ApiFieldErrors | null;
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export type Pagination = {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: Pagination;
};
