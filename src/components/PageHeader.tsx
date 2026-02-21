import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  description?: string;
  color: string;
}

export function PageHeader({ title, description, color }: PageHeaderProps) {
  return (
    <header className={styles.header} style={{ background: color }}>
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

