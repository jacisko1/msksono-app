import { Link } from "react-router-dom";
import { useLanguage } from "../data/language";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <section className={styles.box}>
      <h1>404</h1>
      <p>{t("notFoundMessage")}</p>
      <Link to="/">{t("backHome")}</Link>
    </section>
  );
}

