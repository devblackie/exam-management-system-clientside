
// clientside/src/config/axiosInstance.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  xsrfCookieName: "csrfToken",        
  xsrfHeaderName: "X-CSRF-Token",     
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isResetPage = window.location.pathname.startsWith("/reset-password");
      if (
        typeof window !== "undefined" &&
        !isResetPage &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;