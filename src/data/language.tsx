import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "cs" | "en";

const STORAGE_KEY = "msk-us-locale";

const translations = {
  home: { cs: "Domů", en: "Home" },
  installApp: { cs: "Instalovat aplikaci", en: "Install App" },
  toggleMenu: { cs: "Přepnout menu", en: "Toggle menu" },
  breadcrumbAria: { cs: "Drobková navigace", en: "Breadcrumb" },
  homeIntro: {
    cs: "Praktická výuka muskuloskeletální ultrasonografie v jasně strukturovaných modulech.",
    en: "Practical musculoskeletal ultrasound education in clearly structured modules."
  },
  contentComingSoon: { cs: "Obsah se připravuje", en: "Content coming soon" },
  contentPlaceholderBody: {
    cs: "Obsah bude doplněn.",
    en: "Content will be added."
  },
  sectionNotFound: { cs: "Sekce nenalezena", en: "Section not found" },
  pageNotFound: { cs: "Stránka nenalezena", en: "Page not found" },
  sectionHeaderDescription: {
    cs: "Vyberte podsekci pro detailní studium.",
    en: "Choose a subsection for detailed study."
  },
  notFoundMessage: { cs: "Požadovaná stránka nebyla nalezena.", en: "Requested page was not found." },
  backHome: { cs: "Zpět na úvod", en: "Back to home" },
  offlineTitle: { cs: "Offline režim", en: "Offline mode" },
  offlineMessage: {
    cs: "Aplikace běží bez připojení. Dříve načtené sekce zůstávají dostupné.",
    en: "The app is running offline. Previously loaded sections remain available."
  },
  installIosHint: {
    cs: "V iPhone Safari otevřete Sdílet a zvolte Přidat na plochu.",
    en: "In iPhone Safari, open Share and choose Add to Home Screen."
  },
  installAndroidHint: {
    cs: "V Android Chrome otevřete menu prohlížeče (tři tečky) a zvolte Přidat na plochu nebo Instalovat aplikaci.",
    en: "In Android Chrome, open the browser menu (three dots) and choose Add to Home screen or Install app."
  },
  installSecureHint: {
    cs: "Instalace PWA vyžaduje zabezpečené připojení HTTPS. Otevřete aplikaci přes HTTPS URL a zkuste to znovu.",
    en: "PWA installation requires a secure HTTPS connection. Open the app via an HTTPS URL and try again."
  },
  installUnavailableHint: {
    cs: "Instalace není v tomto prohlížeči právě dostupná. Zkuste nabídku prohlížeče: Přidat na plochu.",
    en: "Install is not available in this browser right now. Open the app over HTTPS and try again."
  },
  loading: { cs: "Načítám...", en: "Loading..." },
  goToSection: { cs: "Přejít do sekce", en: "Go to section" }
} as const;

type TranslationKey = keyof typeof translations;

interface LanguageContextValue {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const detectInitialLocale = (): Locale => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "cs" || saved === "en") {
    return saved;
  }
  return navigator.language.toLowerCase().startsWith("cs") ? "cs" : "en";
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Locale>(detectInitialLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => translations[key][lang]
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
