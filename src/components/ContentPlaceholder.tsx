import { useLanguage } from "../data/language";
import styles from "./ContentPlaceholder.module.css";

interface ContentPlaceholderProps {
  title?: string;
}

export function ContentPlaceholder({ title }: ContentPlaceholderProps) {
  const { t } = useLanguage();

  return (
    <section className={styles.box}>
      <h2>{title ?? t("contentComingSoon")}</h2>
      <p>{t("contentPlaceholderBody")}</p>
    </section>
  );
}

