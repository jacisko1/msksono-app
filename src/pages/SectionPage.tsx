import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { GridMenu } from "../components/GridMenu";
import { PageHeader } from "../components/PageHeader";
import { useLanguage } from "../data/language";
import { findNavItem, localize } from "../data/navigation";
import styles from "./SharedPages.module.css";

interface SectionPageProps {
  path: string;
}

export default function SectionPage({ path }: SectionPageProps) {
  const { lang, t } = useLanguage();
  const node = findNavItem(path);

  if (!node) {
    return <ContentPlaceholder title={t("sectionNotFound")} />;
  }

  return (
    <section className={styles.stack}>
      <PageHeader
        title={localize(node.title, lang)}
        color={node.color}
        description={t("sectionHeaderDescription")}
      />
      {node.children?.length ? <GridMenu items={node.children} color={node.color} /> : null}
      <ContentPlaceholder />
    </section>
  );
}

