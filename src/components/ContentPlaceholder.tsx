import styles from "./ContentPlaceholder.module.css";

interface ContentPlaceholderProps {
  title?: string;
}

export function ContentPlaceholder({ title = "Content coming soon" }: ContentPlaceholderProps) {
  return (
    <section className={styles.box}>
      <h2>{title}</h2>
      <p>Tato sekce je připravená pro doplnění výukového obsahu, videí a klinických poznámek.</p>
    </section>
  );
}

