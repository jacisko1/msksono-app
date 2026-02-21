import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../data/language";
import { getBreadcrumbItems, localize } from "../data/navigation";
import styles from "./Breadcrumbs.module.css";

export function Breadcrumbs() {
  const location = useLocation();
  const { lang, t } = useLanguage();
  const crumbs = getBreadcrumbItems(location.pathname);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label={t("breadcrumbAria")}>
      <Link to="/">{t("home")}</Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className={styles.crumb}>
          <span aria-hidden>/</span>
          {crumb.path === location.pathname ? (
            <strong>{localize(crumb.title, lang)}</strong>
          ) : (
            <Link to={crumb.path}>{localize(crumb.title, lang)}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

