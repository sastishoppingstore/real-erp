import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

let isRedirectingToLogin = false;

// Public/guest routes where being unauthenticated is expected.
// On these pages a 401 (e.g. settings.themeGet / sync.pull / auth.me) must
// NOT trigger a redirect to /login. That previously bounced /register away
// before the submit could react, so the user saw "no response".
const PUBLIC_AUTH_ROUTES = [
  "/login", "/register", "/forgot-password", "/reset-password",
  "/verify-otp", "/select-plan", "/company-onboarding",
];
function isPublicAuthRoute(path: string) {
  return PUBLIC_AUTH_ROUTES.includes(path) || path === "/" || path.startsWith("/reset-password");
}

function handleUnauthorized() {
  if (isRedirectingToLogin) return;
  const currentPath = window.location.pathname;
  if (isPublicAuthRoute(currentPath)) {
    // Guest flows: silently swallow the 401 instead of bouncing pages.
    return;
  }
  isRedirectingToLogin = true;
  try {
    localStorage.removeItem("language");
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  } finally {
    setTimeout(() => { isRedirectingToLogin = false; }, 2000);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error instanceof TRPCClientError) {
          const statusCode = error?.data?.httpStatus ?? error?.cause?.status;
          if (statusCode === 401) return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error: any) => {
        if (error instanceof TRPCClientError) {
          const statusCode = error?.data?.httpStatus ?? error?.cause?.status;
          if (statusCode === 401) {
            handleUnauthorized();
          }
        }
      },
    },
  },
  queryCache: undefined,
});

queryClient.getQueryCache().config.onError = (error: any) => {
  if (error instanceof TRPCClientError) {
    const statusCode = error?.data?.httpStatus ?? error?.cause?.status;
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
        try {
          const token = typeof window !== "undefined" ? localStorage.getItem("erp_sid") : null;
          return token ? { authorization: `Bearer ${token}` } : {};
        } catch {
          return {};
        }
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).then((response) => {
          // Tauri/desktop fix: ensure response has a valid .headers object
          // before tRPC's httpBatchLink tries to read batch headers
          if (!response || typeof response?.headers === "undefined") {
            throw new Error("Network or Server Error");
          }
          return response;
        }).catch((err: any) => {
          const errorMsg = err?.message || err?.response?.data?.message || "Network or Server Error";
          throw new Error(errorMsg);
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
