import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.eyebrow}>Phase 1 skeleton</p>
        <h1 className={styles.title}>Canadian Jats Association</h1>
        <p className={styles.tagline}>
          Community website for CJA — Next.js on Cloudflare Workers.
        </p>
        <p className={styles.note}>
          This is a placeholder home page. Member directory, auth, payments, and
          full site content are out of scope for Phase 1.
        </p>
      </main>
    </div>
  );
}
