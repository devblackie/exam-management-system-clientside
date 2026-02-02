// clientside/src/hooks/useServerHealth.ts
import { useState, useEffect } from "react";
import api from "@/config/axiosInstance";

export function useServerHealth() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // This hits your app.get("/health") in app.ts
        const response = await api.get("/health");
        setIsOnline(response.status === 200);
      } catch {
        setIsOnline(false);
      }
    };

    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return isOnline;
}