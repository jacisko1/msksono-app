import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { findNavItem, localize } from "../data/navigation";
import styles from "./SharedPages.module.css";

interface ContentPageProps {
  path: string;
}

export default function ContentPage({ path }: ContentPageProps) {
  const { lang, t } = useLanguage();
  const node = findNavItem(path);
  const isShoulderVideo = path === "/klouby/rameno/video-tutorial";
  const isShoulderEmpty =
    path === "/klouby/rameno/uvod" || path === "/klouby/rameno/vysetrovaci-protokol";

  if (!node) {
    return <ContentPlaceholder title={t("pageNotFound")} />;
  }

  if (isShoulderVideo) {
    const openLabel = lang === "cs" ? "Otevřít na YouTube" : "Open on YouTube";

    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.videoBox}>
          <div className={styles.videoWrap}>
            <iframe
              src="https://www.youtube-nocookie.com/embed/TCpKWtJ9g9A"
              title="Rameno video tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <a
            className={styles.videoLink}
            href="https://youtu.be/TCpKWtJ9g9A?si=dNeZ-vvJKZIh6E1b"
            target="_blank"
            rel="noreferrer"
          >
            {openLabel}
          </a>
        </section>
      </section>
    );
  }

  if (isShoulderEmpty) {
    return (
      <section className={styles.stack}>
        <PageHeader title={localize(node.title, lang)} color={node.color} />
        <section className={styles.emptyBox} />
      </section>
    );
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={localize(node.title, lang)} color={node.color} />
      <ContentPlaceholder />
    </section>
  );
}
