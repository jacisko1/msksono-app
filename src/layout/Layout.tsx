import { type CSSProperties, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logoMark from "../assets/logo-mark.svg";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { useLanguage } from "../data/language";
import { getThemeColor, localize, navigationTree } from "../data/navigation";
import styles from "./Layout.module.css";

const isSectionActive = (pathname: string, sectionPath: string) =>
  pathname === sectionPath || pathname.startsWith(`${sectionPath}/`);

export function Layout() {
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const activeColor = getThemeColor(location.pathname);

  useEffect(() => {
    const inStandalone =
      window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    setIsInstalled(inStandalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }

    if (!window.isSecureContext) {
      window.alert(t("installSecureHint"));
      return;
    }

    const userAgent = window.navigator.userAgent;
    const isAndroid = /android/i.test(userAgent);
    const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

    if (isIos) {
      window.alert(t("installIosHint"));
      return;
    }

    if (isAndroid) {
      window.alert(t("installAndroidHint"));
      return;
    }

    window.alert(t("installUnavailableHint"));
  };

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <div className={styles.brandWrap}>
          <Link className={styles.brand} to="/" onClick={() => setMobileOpen(false)}>
            <img src={logoMark} alt="MSK Sono logo" />
            <span>msksono.org</span>
          </Link>

          <div className={styles.topControls}>
            <div className={styles.langSwitch} role="group" aria-label="Language">
              <button
                type="button"
                className={`${styles.langBtn} ${lang === "cs" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("cs")}
              >
                CZ
              </button>
              <button
                type="button"
                className={`${styles.langBtn} ${lang === "en" ? styles.langBtnActive : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
            </div>
          </div>

          <button
            className={styles.menuToggle}
            type="button"
            aria-expanded={mobileOpen}
            aria-label={t("toggleMenu")}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {"\u2630"}
          </button>

          {!isInstalled ? (
            <div className={styles.installRow}>
              <button className={styles.installButton} type="button" onClick={handleInstallClick}>
                {t("installApp")}
              </button>
            </div>
          ) : null}
        </div>

        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ""}`} aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.homeActive : ""}`.trim()}
            onClick={() => setMobileOpen(false)}
          >
            {t("home")}
          </NavLink>
          {navigationTree.map((section) => (
            <NavLink
              key={section.path}
              to={section.path}
              className={`${styles.link} ${isSectionActive(location.pathname, section.path) ? styles.active : ""}`}
              style={
                isSectionActive(location.pathname, section.path)
                  ? ({ "--active-color": section.color } as CSSProperties)
                  : undefined
              }
              onClick={() => setMobileOpen(false)}
            >
              {localize(section.title, lang)}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.crumbWrap}>
          <Breadcrumbs />
        </div>
        <div className={styles.page} style={{ "--section-color": activeColor } as CSSProperties}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
