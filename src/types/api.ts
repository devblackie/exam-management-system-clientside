// src/types/api.ts
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
