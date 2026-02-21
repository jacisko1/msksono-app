import { SectionCard } from "../components/SectionCard";
import { navigationTree } from "../data/navigation";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <section className={styles.wrap}>
      <header className={styles.header}>
        <h1>MSK Ultrasound Academy</h1>
        <p>Praktická výuka muskuloskeletální ultrasonografie v jasně strukturovaných modulech.</p>
      </header>

      <div className={styles.grid}>
        {navigationTree.map((section) => (
          <SectionCard key={section.path} section={section} />
        ))}
      </div>
    </section>
  );
}

