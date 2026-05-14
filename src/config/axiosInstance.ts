
// // clientside/src/config/axiosInstance.ts
// import axios from "axios";

// function getCookie(name: string): string | undefined {
//   if (typeof document === "undefined") return undefined;
//   return document.cookie
//     .split("; ")
//     .find((row) => row.startsWith(`${name}=`))
//     ?.split("=")[1];
// }

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
//   withCredentials: true,
//   timeout: 15000,
// });

// // ── Request interceptor: attach CSRF token on every mutating request ──────────
// api.interceptors.request.use((config) => {
//   const method = (config.method ?? "get").toUpperCase();
//   if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
//     const token = getCookie("csrfToken");
//     if (token) config.headers["X-CSRF-Token"] = token;
//   }
//   return config;
// });

// // ── Response interceptor: handle 401 globally ────────────────────────────────
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (
//       error.response?.status === 401 &&
//       typeof window !== "undefined" &&
//       !window.location.pathname.startsWith("/reset-password") &&
//       window.location.pathname !== "/login"
//     ) {
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );


// export default api;



// clientside/src/config/axiosInstance.ts — COMPLETE, FINAL

import axios from "axios";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find(row => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  withCredentials: true,
  timeout:         15000,
});

// ── Request interceptor: attach CSRF token on mutating requests ───────────────
api.interceptors.request.use(config => {
  const method = (config.method ?? "get").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = getCookie("csrfToken");
    if (token) config.headers["X-CSRF-Token"] = token;
  }
  return config;
});

// Pages where a 401 should NOT redirect to /login.
// These pages are intentionally unauthenticated — redirecting breaks them.
const NO_REDIRECT_PAGES = [
  "/login",
  "/secret-register",
  "/register",          // invite-based registration
  "/reset-password",
  "/unauthorized",
  "/coordinator-secret",
  "/demo",
  "/signup",
];

// ── Response interceptor: handle session expiry globally ─────────────────────
api.interceptors.response.use(
  response => response,
  error => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const pathname = window.location.pathname;
      const isPublic = NO_REDIRECT_PAGES.some(p => pathname.startsWith(p));
      if (!isPublic) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;