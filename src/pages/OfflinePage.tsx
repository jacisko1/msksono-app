import { useLanguage } from "../data/language";
import styles from "./OfflinePage.module.css";

export default function OfflinePage() {
  const { t } = useLanguage();

  return (
    <section className={styles.box}>
      <h1>{t("offlineTitle")}</h1>
      <p>{t("offlineMessage")}</p>
    </section>
  );
}

