// clientside/src/hooks/queries/useAuth.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  me,
  logout,
  checkEmail,
  verifyPassword,
  verifyOtp,
  forgotPassword,
  resetPassword,
  registerWithInvite,
} from "@/api/authApi";

export const AUTH_KEYS = {
  me: ["auth", "me"] as const,
};

/** Drop-in for the manual me() call in AuthContext */
export const useMe = () =>
  useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: me,
    retry: false, // don't retry 401s — user is just not logged in
    staleTime: 10 * 60 * 1000,
  });

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear(); // wipe entire cache on logout
      window.location.href = "/login";
    },
  });
};

export const useCheckEmail = () =>
  useMutation({ mutationFn: (email: string) => checkEmail(email) });
export const useVerifyPassword = () =>
  useMutation({ mutationFn: (pw: string) => verifyPassword(pw) });
export const useVerifyOtp = () =>
  useMutation({ mutationFn: (otp: string) => verifyOtp(otp) });
export const useForgotPassword = () =>
  useMutation({ mutationFn: (email: string) => forgotPassword(email) });
export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      resetPassword(token, password),
  });
export const useRegisterWithInvite = () =>
  useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      registerWithInvite(token, password),
  });
