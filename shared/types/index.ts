export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY_FOR_PICKUP"
  | "COMPLETED"
  | "CANCELLED";
