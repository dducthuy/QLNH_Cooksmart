export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data: T;
}

export interface ApiListResponse<T> {
  status: "success" | "error";
  results: number;
  data: T[];
}

export interface ApiErrorResponse {
  status: "error" | "fail";
  message: string;
  stack?: string;
}