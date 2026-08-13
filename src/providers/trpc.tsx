import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

let isRedirectingToLogin = false;

function handleUnauthorized() {
  if (isRedirectingToLogin) return;
  isRedirectingToLogin = true;
  try {
    localStorage.removeItem("language");
    const currentPath = window.location.pathname;
    if (currentPath !== "/login") {
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  } finally {
    setTimeout(() => { isRedirectingToLogin = false; }, 2000);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof TRPCClientError) {
          const statusCode = error.data?.httpStatus ?? error.cause?.status;
          if (statusCode === 401) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        if (error instanceof TRPCClientError) {
          const statusCode = error.data?.httpStatus ?? error.cause?.status;
          if (statusCode === 401) {
            handleUnauthorized();
          }
        }
      },
    },
  },
  queryCache: undefined,
});

queryClient.getQueryCache().config.onError = (error) => {
  if (error instanceof TRPCClientError) {
    const statusCode = error.data?.httpStatus ?? error.cause?.status;
    if (statusCode === 401) {
      handleUnauthorized();
    }
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const token = typeof window !== "undefined" ? localStorage.getItem("erp_sid") : null;
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
