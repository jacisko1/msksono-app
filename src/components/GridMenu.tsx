import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

const PROGRESS_STORAGE_KEY = "msk-us-progress-v1";

export function GridMenu({ items, color }: GridMenuProps) {
  const { lang } = useLanguage();
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setDoneByPath(parsed as Record<string, boolean>);
      }
    } catch {
      setDoneByPath({});
    }
  }, []);

  const toggleDone = (path: string) => {
    setDoneByPath((current) => {
      const next = { ...current, [path]: !current[path] };
      try {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage errors (e.g. private mode quota)
      }
      return next;
    });
  };

  const isNavItemDone = (navItem: NavItem): boolean => {
    if (navItem.children?.length) {
      return navItem.children.every((child) => isNavItemDone(child));
    }
    return Boolean(doneByPath[navItem.path]);
  };

  return (
    <section className={styles.grid}>
      {items.map((item) => {
        const title = localize(item.title, lang);
        const hasChildren = Boolean(item.children?.length);
        const isDone = isNavItemDone(item);
        const progressLabel =
          hasChildren
            ? lang === "cs"
              ? "Automaticky podle podkapitol"
              : "Automatic based on subchapters"
            : lang === "cs"
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
              disabled={hasChildren}
              onClick={() => toggleDone(item.path)}
            >
              ✓
            </button>
          </article>
        );
      })}
    </section>
  );
}
