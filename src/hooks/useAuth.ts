import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();

  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    isError,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  useEffect(() => {
    if (isError && error?.data?.httpStatus === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [isError, error, navigate, redirectPath]);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && isError) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, isError, navigate, redirectPath]);

  const safeUser = useMemo(() => {
    if (isError || !user) return null;
    if (typeof user !== "object") return null;
    return user;
  }, [user, isError]);

  return useMemo(
    () => ({
      user: safeUser,
      isAuthenticated: !!safeUser,
      isLoading: isLoading || logoutMutation.isPending,
      isError,
      error,
      logout,
      refresh: refetch,
    }),
    [safeUser, isLoading, logoutMutation.isPending, isError, error, logout, refetch],
  );
}
