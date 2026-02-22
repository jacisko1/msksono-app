import { SectionCard } from "../components/SectionCard";
import { useLanguage } from "../data/language";
import { navigationTree } from "../data/navigation";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <p>{t("homeIntro")}</p>
      </header>

      <div className={styles.grid}>
        {navigationTree.map((section) => (
          <SectionCard key={section.path} section={section} />
        ))}
      </div>
    </section>
  );
}
