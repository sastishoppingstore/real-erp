import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { trpc } from "./trpc";

export type LayoutTheme = "sidebar" | "app_launcher" | "launcher_theme";

interface LayoutThemeContextValue {
  layoutTheme: LayoutTheme;
  setLayoutTheme: (theme: LayoutTheme) => void;
  isAppLauncher: boolean;
  isLoading: boolean;
}

const LayoutThemeContext = createContext<LayoutThemeContextValue>({
  layoutTheme: "sidebar",
  setLayoutTheme: () => {},
  isAppLauncher: false,
  isLoading: true,
});

export function LayoutThemeProvider({ children }: { children: ReactNode }) {
  const { data: settings, isLoading } = trpc.settings.themeGet.useQuery(undefined, {
    retry: false,
    staleTime: 1000 * 60 * 10,
  });
  const updateTheme = trpc.settings.themeUpdate.useMutation();
  const [layoutTheme, setLayoutThemeState] = useState<LayoutTheme>("launcher_theme");

  useEffect(() => {
    if (settings?.layoutTheme) {
      const theme = settings.layoutTheme;
      if (theme === "sidebar" || theme === "app_launcher" || theme === "launcher_theme") {
        setLayoutThemeState(theme);
      }
    }
  }, [settings?.layoutTheme]);

  const setLayoutTheme = (theme: LayoutTheme) => {
    setLayoutThemeState(theme);
    updateTheme.mutate({ layoutTheme: theme });
  };

  return (
    <LayoutThemeContext.Provider
      value={{
        layoutTheme,
        setLayoutTheme,
        isAppLauncher: layoutTheme === "app_launcher" || layoutTheme === "launcher_theme",
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
