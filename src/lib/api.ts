// clientside/src/lib/api.ts
import api  from "@/config/axiosInstance";
import axios from "axios";
import type {
  User, Role, Status, Invite,
  EmailCheckResult, PasswordVerifyResult,
  BackendErrorResponse,
} from "@/api/types";
 
export type { User, Role, Status, Invite, EmailCheckResult, PasswordVerifyResult };
// ─── User shape (returned by /auth/me and /admin/users) ───────────────────────

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data   = error.response?.data as BackendErrorResponse | undefined;
    if (data?.message) return data.message;
    const status = error.response?.status;
    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403) return "You do not have permission for this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 409) return "A conflict occurred — the record may already exist.";
    if (status === 422) return "Validation failed. Please check your inputs.";
    if (status === 429) return "Too many requests. Please wait a moment.";
    if (status && status >= 500) return "A server error occurred. Please try again later.";
    if (error.request)  return "Unable to reach the server. Check your connection.";
    return error.message || "An unexpected error occurred.";
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unexpected error occurred.";
}

