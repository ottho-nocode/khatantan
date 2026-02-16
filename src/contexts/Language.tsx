import { createContext, useContext, useState, useCallback } from "react";
import { translations, type Locale } from "@/i18n/translations";

interface LanguageState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const STORAGE_KEY = "khatantan-locale";

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "fr";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "fr" || stored === "en" || stored === "mn") return stored;
  return "fr";
}

const LanguageContext = createContext<LanguageState | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = translations[locale][key] ?? translations.fr[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, v);
        }
      }
      return value;
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
