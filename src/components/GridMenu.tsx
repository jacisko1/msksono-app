import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import { localize, type NavItem } from "../data/navigation";
import styles from "./GridMenu.module.css";

interface GridMenuProps {
  items: NavItem[];
  color: string;
}

interface JointImageSet {
  pc: string;
  tablet: string;
  phone: string;
}

const jointImages: Record<string, JointImageSet> = {
  "/klouby/rameno": {
    pc: "/assets/rameno_pc.webp",
    tablet: "/assets/rameno_tablet.webp",
    phone: "/assets/rameno_phone.webp"
  },
  "/klouby/loket": {
    pc: "/assets/loket_pc.webp",
    tablet: "/assets/loket_tablet.webp",
    phone: "/assets/loket_phone.webp"
  },
  "/klouby/zapesti": {
    pc: "/assets/zapesti_pc.webp",
    tablet: "/assets/zapesti_tablet.webp",
    phone: "/assets/zapesti_phone.webp"
  },
  "/klouby/kycel": {
    pc: "/assets/kycel_pc.webp",
    tablet: "/assets/kycel_tablet.webp",
    phone: "/assets/kycel_phone.webp"
  },
  "/klouby/koleno": {
    pc: "/assets/koleno_pc.webp",
    tablet: "/assets/koleno_tablet.webp",
    phone: "/assets/koleno_phone.webp"
  },
  "/klouby/kotnik": {
    pc: "/assets/kotnik_pc.webp",
    tablet: "/assets/kotnik_tablet.webp",
    phone: "/assets/kotnik_phone.webp"
  }
};

export function GridMenu({ items, color }: GridMenuProps) {
  const { lang, t } = useLanguage();

  return (
    <section className={styles.grid}>
      {items.map((item) => {
        const image = jointImages[item.path];
        const title = localize(item.title, lang);

        return (
          <Link
            key={item.path}
            className={`${styles.card} ${image ? styles.cardWithImage : ""}`}
            style={{ borderColor: color }}
            to={item.path}
          >
            {image ? (
              <picture className={styles.imageWrap} aria-hidden="true">
                <source media="(max-width: 640px)" srcSet={image.phone} />
                <source media="(max-width: 1024px)" srcSet={image.tablet} />
                <img className={styles.image} src={image.pc} alt="" loading="lazy" />
              </picture>
            ) : null}
            <div className={styles.content}>
              <h3>{title}</h3>
              <span>{t("openSection")}</span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
