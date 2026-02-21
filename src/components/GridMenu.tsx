import { Link } from "react-router-dom";
import type { NavItem } from "../data/navigation";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

export function GridMenu({ items, color }: GridMenuProps) {
  return (
    <section className={styles.grid}>
      {items.map((item) => (
        <Link key={item.path} className={styles.card} style={{ borderColor: color }} to={item.path}>
          <h3>{item.title}</h3>
          <span>Open section</span>
        </Link>
      ))}
    </section>
  );
}

