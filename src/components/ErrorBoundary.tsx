import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    (window as any).__EB = { name: error?.name, message: error?.message, stack: String(error?.stack), componentStack: String(errorInfo?.componentStack) };
    console.error("[EB] captured");
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white dark:bg-slate-900">
          <div className="max-w-md p-6 text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {/Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
              this.state.error?.message || ""
            ) && (
              <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
                A new version was just published. Load it fresh below.
              </p>
            )}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  try {
                    if ("serviceWorker" in navigator) {
                      navigator.serviceWorker
                        .getRegistrations()
                        .then((regs) => regs.forEach((r) => r.unregister()))
                        .catch(() => {});
                    }
                    if ("caches" in window) {
                      caches
                        .keys()
                        .then((keys) => keys.forEach((k) => caches.delete(k)))
                        .catch(() => {});
                    }
                  } catch {
                    /* ignore */
                  }
                  try {
                    sessionStorage.removeItem("erp:chunk-reload");
                    localStorage.removeItem("erp:sw-migrated-v2");
                  } catch {
                    /* ignore */
                  }
                  setTimeout(() => {
                    window.location.href =
                      window.location.pathname + "?v=" + Date.now();
                  }, 300);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
              >
                Load latest version
              </button>
              <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/login";
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
