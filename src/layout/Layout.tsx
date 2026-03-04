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
        <div className={styles.headerInner}>
          <div className={styles.brandWrap}>
            <Link className={styles.brand} to="/" onClick={() => setMobileOpen(false)}>
              <img src={logoMark} alt="MSK Sono logo" />
            </Link>

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
            <NavLink
              to="/muj-ucet"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.homeActive : ""}`.trim()}
              onClick={() => setMobileOpen(false)}
            >
              {t("accountTab")}
            </NavLink>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.crumbWrap}>
          <Breadcrumbs />
        </div>
        <div className={styles.page} style={{ "--section-color": activeColor } as CSSProperties}>
          <Outlet />
        </div>
      </main>

      <nav className={styles.bottomBar} aria-label="Bottom navigation">
        <NavLink to="/" className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomActive : ""}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3.2 3 10.8v9a1 1 0 0 0 1 1h5.3a1 1 0 0 0 1-1V15h3.4v4.8a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1v-9l-9-7.6Z" />
          </svg>
          <span>{t("home")}</span>
        </NavLink>

        <div className={styles.bottomLang} role="group" aria-label="Language">
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

        <NavLink
          to="/muj-ucet"
          className={({ isActive }) => `${styles.bottomItem} ${isActive ? styles.bottomActive : ""}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 12.25a4.75 4.75 0 1 0 0-9.5 4.75 4.75 0 0 0 0 9.5Zm0 2c-4.55 0-8.25 2.83-8.25 6.31 0 .38.31.69.69.69h15.12c.38 0 .69-.31.69-.69 0-3.48-3.7-6.31-8.25-6.31Z" />
          </svg>
          <span>{t("accountTab")}</span>
        </NavLink>
      </nav>
    </div>
  );
}
