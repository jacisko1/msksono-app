import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { localize, navigationTree, type NavItem } from "../data/navigation";
import { PROGRESS_STORAGE_KEY, PROGRESS_UPDATED_EVENT, readProgress } from "../data/progress";
import styles from "./AccountPage.module.css";

interface SectionProgress {
  path: string;
  title: string;
  color: string;
  done: number;
  total: number;
  percent: number;
}

interface SectionMilestone {
  path: string;
  title: { cs: string; en: string };
  icon: "basics" | "joints" | "nerves" | "muscles";
  color: string;
}

const getLeafNodes = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => (item.children?.length ? getLeafNodes(item.children) : [item]));

const sectionMilestones: SectionMilestone[] = [
  {
    path: "/basics",
    title: { cs: "Základy", en: "Basics" },
    icon: "basics",
    color: "#209069"
  },
  {
    path: "/klouby",
    title: { cs: "Klouby", en: "Joints" },
    icon: "joints",
    color: "#00626c"
  },
  {
    path: "/periferni-nervy",
    title: { cs: "Nervy", en: "Nerves" },
    icon: "nerves",
    color: "#d2be00"
  },
  {
    path: "/svaly",
    title: { cs: "Svaly", en: "Muscles" },
    icon: "muscles",
    color: "#9a2626"
  }
];

function MilestoneIcon({ kind, color }: { kind: SectionMilestone["icon"]; color: string }) {
  if (kind === "basics") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="10" y="14" width="44" height="36" rx="8" fill={color} opacity="0.22" />
        <circle cx="32" cy="32" r="10" fill="none" stroke={color} strokeWidth="4" />
        <path d="M32 20v24M20 32h24" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "joints") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="22" cy="22" r="8" fill={color} />
        <circle cx="42" cy="42" r="8" fill={color} />
        <rect x="26" y="26" width="12" height="12" rx="4" fill={color} opacity="0.45" />
        <path d="M28 28L36 36" stroke={color} strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === "nerves") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M14 48c8-8 10-14 16-14s8 6 14 6 8-5 12-9"
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="14" cy="48" r="4" fill={color} />
        <circle cx="30" cy="34" r="4" fill={color} />
        <circle cx="44" cy="40" r="4" fill={color} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M14 46c2-12 10-20 18-20s16 8 18 20" fill={color} opacity="0.22" />
      <path d="M18 44c2-9 7-14 14-14s12 5 14 14" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M26 30v-8m12 8v-8" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function AccountPage() {
  const { lang, t } = useLanguage();
  const [animateProgress, setAnimateProgress] = useState(false);
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"stats" | "badges">("stats");

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimateProgress(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const syncProgress = () => setDoneByPath(readProgress());
    syncProgress();

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === PROGRESS_STORAGE_KEY) {
        syncProgress();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(PROGRESS_UPDATED_EVENT, syncProgress);
    };
  }, []);

  const sectionProgress = useMemo<SectionProgress[]>(
    () =>
      navigationTree.map((section) => {
        const leaves = getLeafNodes(section.children ?? []);
        const total = leaves.length;
        const done = leaves.filter((item) => Boolean(doneByPath[item.path])).length;
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
    [doneByPath, lang]
  );

  const milestones = useMemo(
    () =>
      sectionMilestones.map((milestone) => {
        const progress = sectionProgress.find((item) => item.path === milestone.path);
        const percent = progress?.percent ?? 0;
        const unlocked = percent === 100;
        return { ...milestone, percent, unlocked };
      }),
    [sectionProgress]
  );

  return (
    <section className={styles.wrap}>
      <PageHeader title={t("myAccount")} color="#1f6f78" />
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.tabs} role="tablist" aria-label={lang === "cs" ? "Přepnutí přehledu" : "Overview switch"}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "stats"}
              className={`${styles.tabBtn} ${activeTab === "stats" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("stats")}
            >
              {lang === "cs" ? "Statistiky" : "Statistics"}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "badges"}
              className={`${styles.tabBtn} ${activeTab === "badges" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("badges")}
            >
              {lang === "cs" ? "Odznaky" : "Badges"}
            </button>
          </div>
        </div>
        {activeTab === "stats" ? (
          <div className={styles.progressList}>
            {sectionProgress.map((item) => (
              <article key={item.path} className={styles.progressItem}>
                <div className={styles.progressHead}>
                  <div className={styles.progressLabel}>
                    <h3>{item.title}</h3>
                  </div>
                </div>
                <div className={styles.progressRow}>
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
                  <strong>{item.percent}%</strong>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className={styles.milestoneSection}>
            <div className={styles.milestoneGrid}>
              {milestones.map((item) => (
                <article
                  key={item.path}
                  className={`${styles.milestoneCard} ${item.unlocked ? styles.milestoneCardActive : styles.milestoneCardLocked}`}
                >
                  <div className={styles.milestoneImage}>
                    <MilestoneIcon kind={item.icon} color={item.color} />
                  </div>
                  <h3>{item.title[lang]}</h3>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
