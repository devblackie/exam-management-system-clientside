
// clientside/src/config/axiosInstance.ts
import axios from "axios";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
  // xsrfCookieName: "csrfToken",       // works for same site, but we need to read token from cookie and set header manually for cross-site requests  
  // xsrfHeaderName: "X-CSRF-Token",     // works for same site
});

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       const isResetPage = window.location.pathname.startsWith("/reset-password");
//       if (
//         typeof window !== "undefined" &&
//         !isResetPage &&
//         window.location.pathname !== "/login"
//       ) {
//         window.location.href = "/login";
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// ── Request interceptor: attach CSRF token on every mutating request ──────────
api.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = getCookie("csrfToken");
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }
  return config;
});

// ── Response interceptor: handle 401 globally ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined" &&
      !window.location.pathname.startsWith("/reset-password") &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);


export default api;