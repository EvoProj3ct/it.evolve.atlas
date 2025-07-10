import styles from './Footer.module.css';
import { InstagramIcon, TwitterIcon, TikTokIcon } from './Icons';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.icons}>
        <a href="#" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" aria-label="Twitter"><TwitterIcon /></a>
        <a href="#" aria-label="TikTok"><TikTokIcon /></a>
      </div>
      <span className={styles.copy}>evolve srls</span>
    </footer>
  );
}
