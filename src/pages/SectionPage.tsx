import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { GridMenu } from "../components/GridMenu";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { findNavItem, localize, navigationTree, type NavItem } from "../data/navigation";
import { PROGRESS_STORAGE_KEY, PROGRESS_UPDATED_EVENT, readProgress } from "../data/progress";
import styles from "./SharedPages.module.css";

interface SectionPageProps {
  path: string;
}

const getLeafNodes = (items: NavItem[]): NavItem[] =>
  items.flatMap((item) => (item.children?.length ? getLeafNodes(item.children) : [item]));

export default function SectionPage({ path }: SectionPageProps) {
  const { lang, t } = useLanguage();
  const node = findNavItem(path);
  const [doneByPath, setDoneByPath] = useState<Record<string, boolean>>({});

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

  const sectionProgress = useMemo(() => {
    if (!node?.children?.length) {
      return null;
    }

    const rootSection =
      navigationTree.find(
        (section) => path === section.path || path.startsWith(`${section.path}/`)
      ) ?? node;
    const leaves = getLeafNodes(rootSection.children ?? []);
    const total = leaves.length;
    const done = leaves.filter((item) => Boolean(doneByPath[item.path])).length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { percent };
  }, [path, node, doneByPath]);

  if (!node) {
    return <ContentPlaceholder title={t("sectionNotFound")} />;
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={localize(node.title, lang)} color={node.color} />
      {sectionProgress ? (
        <div
          className={styles.sectionProgressRow}
          aria-label={`${sectionProgress.percent}%`}
          style={{ "--section-progress-color": node.color } as CSSProperties}
        >
          <div className={styles.sectionProgressTrack}>
            <div className={styles.sectionProgressFill} style={{ width: `${sectionProgress.percent}%` }} />
          </div>
          <strong className={styles.sectionProgressPercent}>{sectionProgress.percent}%</strong>
        </div>
      ) : null}
      {node.children?.length ? <GridMenu items={node.children} color={node.color} /> : null}
    </section>
  );
}
