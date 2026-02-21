import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

export default function NotFoundPage() {
  return (
    <section className={styles.box}>
      <h1>404</h1>
      <p>Požadovaná stránka nebyla nalezena.</p>
      <Link to="/">Zpět na Home</Link>
    </section>
  );
}

