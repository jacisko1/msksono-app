import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import styles from "./SectionCard.module.css";

interface SectionCardProps {
  section: NavItem;
}

export function SectionCard({ section }: SectionCardProps) {
  const { lang, t } = useLanguage();
  const title = localize(section.title, lang);

  return (
    <Link
      className={styles.card}
      style={{ background: section.color }}
      to={section.path}
      aria-label={`${t("goToSection")} ${title}`}
    >
      <h2>{title}</h2>
    </Link>
  );
}

