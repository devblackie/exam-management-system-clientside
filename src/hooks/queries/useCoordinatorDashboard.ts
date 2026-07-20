// clientside/src/hooks/queries/useCoordinatorDashboard.ts
import { useQuery } from "@tanstack/react-query";
import {
  getCoordinatorDashboardStats,
  type CoordinatorDashboardStats,
} from "@/api/coordinatorApi";

export const COORDINATOR_KEYS = {
  dashboardStats: ["coordinator", "dashboard-stats"] as const,
};

export const useCoordinatorDashboardStats = () =>
  useQuery<CoordinatorDashboardStats, Error>({
    queryKey: COORDINATOR_KEYS.dashboardStats,
    queryFn: getCoordinatorDashboardStats,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
