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
  symbol: string;
  title: { cs: string; en: string };
  hint: { cs: string; en: string };
  gradient: string;
}

const getLeafNodes = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => (item.children?.length ? getLeafNodes(item.children) : [item]));

const sectionMilestones: SectionMilestone[] = [
  {
    path: "/basics",
    symbol: "FX",
    title: { cs: "Základy sonografie", en: "Ultrasound basics" },
    hint: { cs: "Fyzikální principy a orientace v obraze.", en: "Physical principles and image orientation." },
    gradient: "linear-gradient(135deg, #2aa96b, #0f7044)"
  },
  {
    path: "/klouby",
    symbol: "JT",
    title: { cs: "Kloubní protokoly", en: "Joint protocols" },
    hint: { cs: "Systematické vyšetření velkých i malých kloubů.", en: "Systematic examination of major and minor joints." },
    gradient: "linear-gradient(135deg, #0097a7, #005f68)"
  },
  {
    path: "/periferni-nervy",
    symbol: "NR",
    title: { cs: "Periferní nervy", en: "Peripheral nerves" },
    hint: { cs: "Průběh nervů, inervace a místa útlaku.", en: "Nerve course, innervation, and entrapment sites." },
    gradient: "linear-gradient(135deg, #f1c40f, #b58a00)"
  },
  {
    path: "/svaly",
    symbol: "MS",
    title: { cs: "Svalové jednotky", en: "Muscle units" },
    hint: { cs: "Anatomie, protokol a patologie svalů.", en: "Muscle anatomy, protocol, and pathology." },
    gradient: "linear-gradient(135deg, #cf3f3f, #8b1f1f)"
  }
];

export default function AccountPage() {
  const { lang, t } = useLanguage();
  const [animateProgress, setAnimateProgress] = useState(false);
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});

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
        <div className={styles.progressList}>
          {sectionProgress.map((item) => (
            <article key={item.path} className={styles.progressItem}>
              <div className={styles.progressHead}>
                <div className={styles.progressLabel}>
                  <h3>{item.title}:</h3>
                  <span className={styles.progressMetaInline}>
                    {t("accountDone")} {item.done}/{item.total}
                  </span>
                </div>
                <strong>{item.percent}%</strong>
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
        <section className={styles.milestoneSection}>
          <h2>{lang === "cs" ? "Milníky sekcí" : "Section milestones"}</h2>
          <p>
            {lang === "cs"
              ? "Každý milník se odemkne až při 100 % dokončení celé sekce."
              : "Each milestone unlocks only after 100% completion of the whole section."}
          </p>
          <div className={styles.milestoneGrid}>
            {milestones.map((item) => (
              <article
                key={item.path}
                className={`${styles.milestoneCard} ${item.unlocked ? styles.milestoneCardActive : styles.milestoneCardLocked}`}
              >
                <div className={styles.milestoneSeal} style={{ "--milestone-gradient": item.gradient } as CSSProperties}>
                  <span>{item.symbol}</span>
                </div>
                <h3>{item.title[lang]}</h3>
                <p>{item.hint[lang]}</p>
                <strong>{item.unlocked ? (lang === "cs" ? "100 % splněno" : "100% complete") : `${item.percent}% / 100%`}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
