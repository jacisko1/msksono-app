import styles from "./OfflinePage.module.css";

export default function OfflinePage() {
  return (
    <section className={styles.box}>
      <h1>Offline režim</h1>
      <p>Aplikace běží bez připojení. Dříve načtené sekce zůstávají dostupné.</p>
    </section>
  );
}

