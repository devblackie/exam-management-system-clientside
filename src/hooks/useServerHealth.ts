// clientside/src/hooks/useServerHealth.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useServerHealth(): boolean | null {
  const [isOnline, setIsOnline] = useState<boolean | null>(null); // null = still checking

  const checkHealth = useCallback(async () => {
    try {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || 
                   process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
                   "https://acadedesk.com";

      const response = await axios.get(`${base}/health`, {
        timeout: 5000,
        withCredentials: false,
      });
      setIsOnline(response.status === 200);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // every 30s not 10s
    return () => clearInterval(interval);
  }, [checkHealth]);

  return isOnline;
}