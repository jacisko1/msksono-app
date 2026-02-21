import { Link } from "react-router-dom";
import type { NavItem } from "../data/navigation";
import styles from "./SectionCard.module.css";

interface SectionCardProps {
  section: NavItem;
}

export function SectionCard({ section }: SectionCardProps) {
  return (
    <Link
      className={styles.card}
      style={{ background: section.color }}
      to={section.path}
      aria-label={`Přejít do sekce ${section.title}`}
    >
      <h2>{section.title}</h2>
    </Link>
  );
}

