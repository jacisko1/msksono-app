import { ContentPlaceholder } from "../components/ContentPlaceholder";
import { PageHeader } from "../components/PageHeader";
import { findNavItem } from "../data/navigation";
import styles from "./SharedPages.module.css";

interface ContentPageProps {
  path: string;
}

export default function ContentPage({ path }: ContentPageProps) {
  const node = findNavItem(path);

  if (!node) {
    return <ContentPlaceholder title="Page not found" />;
  }

  return (
    <section className={styles.stack}>
      <PageHeader title={node.title} color={node.color} />
      <ContentPlaceholder />
    </section>
  );
}

