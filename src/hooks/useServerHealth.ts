// // clientside/src/hooks/useServerHealth.ts
// import { useState, useEffect } from "react";
// import axios from "axios";

// export function useServerHealth() {
//   const [isOnline, setIsOnline] = useState(true);

//   useEffect(() => {
//     const checkHealth = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`
//         );
//         setIsOnline(response.status === 200);
//       } catch {
//         setIsOnline(false);
//       }
//     };

//     checkHealth(); // run immediately on mount
//     const interval = setInterval(checkHealth, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return isOnline;
// }





// clientside/src/hooks/useServerHealth.ts
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useServerHealth() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/health`;
      const response = await axios.get(url, {
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
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return isOnline; // null = checking, true = online, false = offline
}