import { createContext, useContext, type ReactNode } from "react";
import { trpc } from "./trpc";

export type LayoutTheme = "sidebar" | "app_launcher" | "launcher_theme";

interface LayoutThemeContextValue {
  layoutTheme: LayoutTheme;
  setLayoutTheme: (theme: LayoutTheme) => void;
  isAppLauncher: boolean;
  isLoading: boolean;
}

const LayoutThemeContext = createContext<LayoutThemeContextValue>({
  layoutTheme: "launcher_theme",
  setLayoutTheme: () => {},
  isAppLauncher: true,
  isLoading: true,
});

export function LayoutThemeProvider({ children }: { children: ReactNode }) {
  const { isLoading } = trpc.settings.themeGet.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  // Single locked theme for every tenant: the extra themes are removed,
  // so switching is a no-op and everyone stays on the launcher theme.
  const setLayoutTheme = (_theme: LayoutTheme) => {};

  return (
    <LayoutThemeContext.Provider
      value={{
        layoutTheme: "launcher_theme",
        setLayoutTheme,
        isAppLauncher: true,
        isLoading,
      }}
    >
      {children}
    </LayoutThemeContext.Provider>
  );
}

export function useLayoutTheme() {
  return useContext(LayoutThemeContext);
}
