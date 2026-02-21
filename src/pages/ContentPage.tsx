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

  if (!node) {
    return <ContentPlaceholder title={t("pageNotFound")} />;
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={localize(node.title, lang)} color={node.color} />
      <ContentPlaceholder />
    </section>
  );
}

