import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { LanguageProvider } from "@/providers/language"
import { Toaster } from "sonner"
import { CountryDetectionProvider, useCountryDetection } from "@/providers/country-detection"
import { useLanguage } from "@/providers/language"
import { SyncProvider } from "@/providers/sync"
import { LicenseGate } from "@/providers/license-gate"
import { ThemeProvider } from "@/providers/theme"
import { LayoutThemeProvider } from "@/providers/layoutTheme"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import App from './App.tsx'

function CountryLanguageBridge() {
  const { selectedCountry, language: detectedLanguage, isRtl } = useCountryDetection();
  const { language, setLang } = useLanguage();
  const initialSync = useRef(true);

  useEffect(() => {
    if (initialSync.current) {
      initialSync.current = false;
      // If user has manually chosen a language, respect their choice
      if (localStorage.getItem("language")) return;
      const nextLanguage = isRtl || detectedLanguage === "ar" ? "ar" : "en";
      if (language !== nextLanguage) {
        setLang(nextLanguage);
      }
    }
  }, [selectedCountry, detectedLanguage, isRtl]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <LanguageProvider>
          <CountryDetectionProvider>
            <CountryLanguageBridge />
            <TRPCProvider>
              <LicenseGate>
                <SyncProvider>
                  <ThemeProvider>
                     <LayoutThemeProvider>
                       <App />
                       <Toaster richColors position="top-center" closeButton />
                     </LayoutThemeProvider>
                  </ThemeProvider>
                </SyncProvider>
              </LicenseGate>
            </TRPCProvider>
          </CountryDetectionProvider>
        </LanguageProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)

// One-shot purge of stale service workers / caches left by older builds.
// Runs at most once per tab session so it can never reload-loop or
// interrupt an in-flight login: after the first pass a session flag
// short-circuits every later page load.
if ("serviceWorker" in navigator) {
  (async function () {
    try {
      if (sessionStorage.getItem("erp:sw-purge-done")) return;
      const regs = await navigator.serviceWorker.getRegistrations();
      if (!regs.length) return;
      sessionStorage.setItem("erp:sw-purge-done", "1");
      for (const reg of regs) {
        try { await reg.unregister(); } catch { /* ignore */ }
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          try { await caches.delete(key); } catch { /* ignore */ }
        }
      }
      // Force one hard reload bypassing SW (clean ?v= param, no history spam)
      const url = new URL(window.location.href);
      url.searchParams.set("v", String(Date.now()));
      window.location.replace(url.toString());
    } catch { /* ignore */ }
  })();
}
