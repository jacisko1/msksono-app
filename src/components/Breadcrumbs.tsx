import { Link, useLocation } from "react-router-dom";
import { getBreadcrumbItems } from "../data/navigation";
import styles from "./Breadcrumbs.module.css";

export function Breadcrumbs() {
  const location = useLocation();
  const crumbs = getBreadcrumbItems(location.pathname);

  if (crumbs.length === 0) {
    return null;
  }

  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className={styles.crumb}>
          <span aria-hidden>/</span>
          {crumb.path === location.pathname ? (
            <strong>{crumb.title}</strong>
          ) : (
            <Link to={crumb.path}>{crumb.title}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}

