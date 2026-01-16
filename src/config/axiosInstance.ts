// clientside/src/config/axiosInstance.ts
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
  // THIS IS THE MISSING PIECE
  xsrfCookieName: "csrfToken",        // if you use CSRF
  xsrfHeaderName: "X-CSRF-Token",     // if you use CSRF
});

// THIS INTERCEPTOR FIXES THE BLOB + CREDENTIALS BUG
api.interceptors.request.use((config) => {
  // Force credentials on every request
  config.withCredentials = true;
  return config;
});



export default api;