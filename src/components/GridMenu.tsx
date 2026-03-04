import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { hasContentForPath } from "../data/contentStatus";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import { readProgress, writeProgress } from "../data/progress";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

export function GridMenu({ items, color }: GridMenuProps) {
  const { lang } = useLanguage();
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDoneByPath(readProgress());
  }, []);

  const collectLeafPaths = (navItem: NavItem, onlyAvailable = false): string[] => {
    if (!navItem.children?.length) {
      if (onlyAvailable && !hasContentForPath(navItem.path)) {
        return [];
      }
      return [navItem.path];
    }

    return navItem.children.flatMap((child) => collectLeafPaths(child, onlyAvailable));
  };

  const toggleDone = (navItem: NavItem) => {
    const leafPaths = collectLeafPaths(navItem, true);
    if (!leafPaths.length) {
      return;
    }
    setDoneByPath((current) => {
      const areAllDone = leafPaths.every((leafPath) => Boolean(current[leafPath]));
      const nextValue = !areAllDone;
      const next = { ...current };

      leafPaths.forEach((leafPath) => {
        next[leafPath] = nextValue;
      });

      writeProgress(next);
      return next;
    });
  };

  const isNavItemDone = (navItem: NavItem): boolean => {
    if (navItem.children?.length) {
      const availableLeafPaths = collectLeafPaths(navItem, true);
      if (!availableLeafPaths.length) {
        return false;
      }
      return availableLeafPaths.every((leafPath) => Boolean(doneByPath[leafPath]));
    }
    if (!hasContentForPath(navItem.path)) {
      return true;
    }
    return Boolean(doneByPath[navItem.path]);
  };

  const hasAnyContent = (navItem: NavItem): boolean => {
    if (navItem.children?.length) {
      return navItem.children.some((child) => hasAnyContent(child));
    }
    return hasContentForPath(navItem.path);
  };

  return (
    <section className={styles.grid}>
      {items.map((item) => {
        const title = localize(item.title, lang);
        const isAvailable = hasAnyContent(item);
        const isDone = isNavItemDone(item);
        const progressLabel =
          lang === "cs"
            ? isDone
              ? "Označit jako nedokončené"
              : "Označit jako dokončené"
            : isDone
              ? "Mark as not completed"
              : "Mark as completed";

        return (
          <article key={item.path} className={styles.card} style={{ borderColor: color }}>
            <Link className={styles.cardLink} to={item.path}>
              <div className={styles.content}>
                <h3 className={isAvailable ? undefined : styles.unavailableTitle}>{title}</h3>
              </div>
            </Link>
            {isAvailable ? (
              <button
                type="button"
                className={`${styles.progressToggle} ${isDone ? styles.progressDone : ""}`}
                aria-label={progressLabel}
                aria-pressed={isDone}
                onClick={() => toggleDone(item)}
              >
                {"\u2713"}
              </button>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
