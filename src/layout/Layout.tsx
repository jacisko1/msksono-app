import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import logoMark from "../assets/logo-mark.svg";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getThemeColor, navigationTree } from "../data/navigation";
import styles from "./Layout.module.css";

const isSectionActive = (pathname: string, sectionPath: string) =>
  pathname === sectionPath || pathname.startsWith(`${sectionPath}/`);

export function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeColor = getThemeColor(location.pathname);

  return (
    <div className={styles.app}>
      <header className={styles.topBar}>
        <div className={styles.brandWrap}>
          <Link className={styles.brand} to="/" onClick={() => setMobileOpen(false)}>
            <img src={logoMark} alt="" />
            <span>MSK Ultrasound Academy</span>
          </Link>
          <button
            className={styles.menuToggle}
            type="button"
            aria-expanded={mobileOpen}
            aria-label="Přepnout menu"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ""}`} aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.homeActive : ""}`.trim()}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </NavLink>
          {navigationTree.map((section) => (
            <NavLink
              key={section.path}
              to={section.path}
              className={`${styles.link} ${isSectionActive(location.pathname, section.path) ? styles.active : ""}`}
              style={
                isSectionActive(location.pathname, section.path)
                  ? ({ "--active-color": section.color } as React.CSSProperties)
                  : undefined
              }
              onClick={() => setMobileOpen(false)}
            >
              {section.title}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <div className={styles.crumbWrap}>
          <Breadcrumbs />
        </div>
        <div className={styles.page} style={{ "--section-color": activeColor } as React.CSSProperties}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

