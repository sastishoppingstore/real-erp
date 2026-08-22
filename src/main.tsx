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

// Immediate force unregister old service worker and clear cache on first load
if ("serviceWorker" in navigator) {
  (async function () {
    const regs = await navigator.serviceWorker.getRegistrations();
    let hadSW = false;
    for (const reg of regs) {
      hadSW = true;
      await reg.unregister();
    }
    if (hadSW && "caches" in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
      // Force hard reload bypassing SW
      window.location.href = window.location.href + "?v=" + Date.now();
    }
  })();
}
