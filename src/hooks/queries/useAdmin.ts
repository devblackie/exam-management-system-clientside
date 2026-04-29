// clientside/src/hooks/queries/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
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
  useQuery({ queryKey: ADMIN_KEYS.users, queryFn: getUsers });

export const useLecturers = () =>
  useQuery({ queryKey: ADMIN_KEYS.lecturers, queryFn: getLecturers });

export const useInvites = () =>
  useQuery({ queryKey: ADMIN_KEYS.invites, queryFn: getInvites });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.users }),
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      updateUserStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.users }),
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.users }),
  });
};

export const useSendInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role, name }: {
      email: string; role: Role; name?: string;
    }) => sendInvite(email, role, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.invites }),
  });
};

export const useRevokeInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeInvite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMIN_KEYS.invites }),
  });
};
