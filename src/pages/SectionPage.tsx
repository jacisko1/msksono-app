import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { GridMenu } from "../components/GridMenu";
import { PageHeader } from "../components/PageHeader";
import { findNavItem } from "../data/navigation";
import styles from "./SharedPages.module.css";

interface SectionPageProps {
  path: string;
}

export default function SectionPage({ path }: SectionPageProps) {
  const node = findNavItem(path);

  if (!node) {
    return <ContentPlaceholder title="Section not found" />;
  }

  return (
    <section className={styles.stack}>
      <PageHeader
        title={node.title}
        color={node.color}
        description="Vyberte podsekci pro detailní studium. Struktura je plně připravená pro rozšíření obsahu."
      />
      {node.children?.length ? <GridMenu items={node.children} color={node.color} /> : null}
      <ContentPlaceholder />
    </section>
  );
}

