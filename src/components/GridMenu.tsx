import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const collectLeafPaths = (navItem: NavItem): string[] => {
    if (!navItem.children?.length) {
      return [navItem.path];
    }

    return navItem.children.flatMap((child) => collectLeafPaths(child));
  };

  const toggleDone = (navItem: NavItem) => {
    const leafPaths = collectLeafPaths(navItem);
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
      const leafPaths = collectLeafPaths(navItem);
      if (!leafPaths.length) {
        return false;
      }
      return leafPaths.every((leafPath) => Boolean(doneByPath[leafPath]));
    }
    return Boolean(doneByPath[navItem.path]);
  };

  return (
    <section className={styles.grid}>
      {items.map((item) => {
        const title = localize(item.title, lang);
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
                <h3>{title}</h3>
              </div>
            </Link>
            <button
              type="button"
              className={`${styles.progressToggle} ${isDone ? styles.progressDone : ""}`}
              aria-label={progressLabel}
              aria-pressed={isDone}
              onClick={() => toggleDone(item)}
            >
              {"\u2713"}
            </button>
          </article>
        );
      })}
    </section>
  );
}
