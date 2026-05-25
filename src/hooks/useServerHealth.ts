// clientside/src/hooks/useServerHealth.ts
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

export type ConnectionStatus =
  | "checking"       // initial / re-checking
  | "online"         // server reachable
  | "server-down"    // internet ok, server unreachable
  | "network-down";  // no internet at all

export interface NetworkInfo {
  /** Mbps estimate from Network Information API — null if unavailable */
  downlink: number | null;
  /** "slow-2g" | "2g" | "3g" | "4g" | null */
  effectiveType: string | null;
  /** Round-trip latency to /health in ms — null if server unreachable */
  latency: number | null;
}

export interface ServerHealth {
  status: ConnectionStatus;
  network: NetworkInfo;
}

// Extend Navigator for the Network Information API (not yet in TS stdlib)
interface NavigatorWithConnection extends Navigator {
  connection?: {
    downlink?: number;
    effectiveType?: string;
    addEventListener: (type: string, cb: () => void) => void;
    removeEventListener: (type: string, cb: () => void) => void;
  };
}

const NEUTRAL_URL = "https://1.1.1.1"; // Cloudflare — purely to test internet
const CHECK_INTERVAL_MS = 30_000;
const HEALTH_TIMEOUT_MS = 5_000;
const NEUTRAL_TIMEOUT_MS = 3_000;

function getBackendBase(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "https://acadedesk.com"
  );
}

function readNetworkInfo(): Pick<NetworkInfo, "downlink" | "effectiveType"> {
  const nav = navigator as NavigatorWithConnection;
  const conn = nav.connection;
  return {
    downlink: conn?.downlink ?? null,
    effectiveType: conn?.effectiveType ?? null,
  };
}

/**
 * Ping a neutral URL to verify internet connectivity.
 * mode: "no-cors" means a CORS error still counts as "reachable" —
 * only an actual network failure (TypeError / abort) means no internet.
 * Uses an AbortController so we don't rely on AbortSignal.timeout()
 * which isn't available in all environments.
 */
async function hasInternet(): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NEUTRAL_TIMEOUT_MS);
  try {
    await fetch(NEUTRAL_URL, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function useServerHealth(): ServerHealth {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const [network, setNetwork] = useState<NetworkInfo>({
    downlink: null,
    effectiveType: null,
    latency: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkHealth = useCallback(async () => {
    // 1. Fastest check: browser's own online flag
    if (!navigator.onLine) {
      setStatus("network-down");
      setNetwork((prev) => ({ ...readNetworkInfo(), latency: prev.latency }));
      return;
    }

    const base = getBackendBase();
    const t0 = performance.now();

    try {
      const response = await axios.get(`${base}/health`, {
        timeout: HEALTH_TIMEOUT_MS,
        withCredentials: false,
      });

      const latency = Math.round(performance.now() - t0);

      if (response.status === 200) {
        setStatus("online");
        setNetwork({ ...readNetworkInfo(), latency });
      } else {
        // Server responded but not healthy
        setStatus("server-down");
        setNetwork((prev) => ({ ...readNetworkInfo(), latency: prev.latency }));
      }
    } catch {
      // Server unreachable — distinguish: server down vs no internet
      const internet = await hasInternet();
      setStatus(internet ? "server-down" : "network-down");
      setNetwork((prev) => ({ ...readNetworkInfo(), latency: prev.latency }));
    }
  }, []);

  useEffect(() => {
    checkHealth();
    intervalRef.current = setInterval(checkHealth, CHECK_INTERVAL_MS);

    // Re-check immediately on browser connectivity events
    const handleOnline = () => checkHealth();
    const handleOffline = () => {
      setStatus("network-down");
      setNetwork((prev) => ({ ...readNetworkInfo(), latency: prev.latency }));
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Also react to Network Information API changes (e.g., wifi → 4G)
    const nav = navigator as NavigatorWithConnection;
    const conn = nav.connection;
    conn?.addEventListener("change", handleOnline);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      conn?.removeEventListener("change", handleOnline);
    };
  }, [checkHealth]);

  return { status, network };
}