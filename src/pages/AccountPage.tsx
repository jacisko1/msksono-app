import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { hasContentForPath } from "../data/contentStatus";
import { localize, navigationTree, type NavItem } from "../data/navigation";
import styles from "./AccountPage.module.css";

interface SectionProgress {
  path: string;
  title: string;
  color: string;
  done: number;
  total: number;
  percent: number;
}

const getLeafNodes = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => (item.children?.length ? getLeafNodes(item.children) : [item]));

export default function AccountPage() {
  const { lang, t } = useLanguage();
  const [animateProgress, setAnimateProgress] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimateProgress(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const sectionProgress = useMemo<SectionProgress[]>(
    () =>
      navigationTree.map((section) => {
        const leaves = getLeafNodes(section.children ?? []);
        const total = leaves.length;
        const done = leaves.filter((item) => hasContentForPath(item.path)).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          path: section.path,
          title: localize(section.title, lang),
          color: section.color,
          done,
          total,
          percent
        };
      }),
    [lang]
  );

  return (
    <section className={styles.wrap}>
      <PageHeader title={t("myAccount")} color="#1f6f78" />
      <div className={styles.card}>
        <h2>{t("accountProgressTitle")}</h2>
        <p>{t("accountProgressHint")}</p>
        <div className={styles.progressList}>
          {sectionProgress.map((item) => (
            <article key={item.path} className={styles.progressItem}>
              <div className={styles.progressHead}>
                <h3>{item.title}</h3>
                <strong>{item.percent}%</strong>
              </div>
              <div className={styles.progressMeta}>
                {item.done}/{item.total} {t("accountDone")}
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={
                    {
                      "--progress": `${animateProgress ? item.percent : 0}%`,
                      "--section-color": item.color
                    } as CSSProperties
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

