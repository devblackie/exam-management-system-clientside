// clientside/src/hooks/queries/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  updateUserDetails,
  deleteUser,
  sendInvite,
  getInvites,
  revokeInvite,
  getLecturers,
} from "@/api/adminApi";
import type { Role, Status } from "@/api/types";

export const ADMIN_KEYS = {
  users: ["admin", "users"] as const,
  invites: ["admin", "invites"] as const,
  lecturers: ["admin", "lecturers"] as const,
};

export const useUsers = () =>
  useQuery({ 
    queryKey: ADMIN_KEYS.users, 
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

export const useLecturers = () =>
  useQuery({ 
    queryKey: ADMIN_KEYS.lecturers, 
    queryFn: getLecturers,
    staleTime: 5 * 60 * 1000,
  });

export const useInvites = () =>
  useQuery({ 
    queryKey: ADMIN_KEYS.invites, 
    queryFn: getInvites,
    staleTime: 5 * 60 * 1000,
  });

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
    },
  });
};

// NEW: Update user details mutation
export const useUpdateUserDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; schoolCode?: string; departmentCode?: string; institutionWide?: boolean } }) =>
      updateUserDetails(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users });
    },
  });
};

export const useSendInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role, name, scope }: { 
      email: string; 
      role: Role; 
      name?: string;
      scope?: { schoolCode?: string; departmentCode?: string; institutionWide?: boolean };
    }) => sendInvite(email, role, name, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.invites });
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.invites });
    },
  });
};