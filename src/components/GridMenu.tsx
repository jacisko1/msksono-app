import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

export function GridMenu({ items, color }: GridMenuProps) {
  const { lang, t } = useLanguage();

  return (
    <section className={styles.grid}>
      {items.map((item) => (
        <Link key={item.path} className={styles.card} style={{ borderColor: color }} to={item.path}>
          <h3>{localize(item.title, lang)}</h3>
          <span>{t("openSection")}</span>
        </Link>
      ))}
    </section>
  );
}

