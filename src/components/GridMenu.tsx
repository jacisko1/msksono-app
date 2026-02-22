import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

export function GridMenu({ items, color }: GridMenuProps) {
  const { lang } = useLanguage();

  return (
    <section className={styles.grid}>
      {items.map((item) => {
        const title = localize(item.title, lang);

        return (
          <Link
            key={item.path}
            className={styles.card}
            style={{ borderColor: color }}
            to={item.path}
          >
            <div className={styles.content}>
              <h3>{title}</h3>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
