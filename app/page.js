import '@/app/styles/buttons.css';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.home}>
      <h1 className={styles.title}>Benvenuto sulla homepage</h1>
      <p className={styles.description}>
        Questa pagina parla di se stessa. Serve come segnaposto mentre
        costruiamo il sito definitivo.
      </p>
      <button className="btn">Un semplice bottone</button>
    </div>
  );
}
