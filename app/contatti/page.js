import '@/app/styles/buttons.css';
import styles from './page.module.css';
import { InstagramIcon, TwitterIcon, TikTokIcon } from '@/components/Icons';

export const metadata = {
  title: 'Contatti',
};

export default function Contatti() {
  return (
    <div className={styles.contact}>
      <h1 className={styles.title}>Contattaci</h1>
      <p className={styles.description}>
        Questa pagina sa di essere solo un segnaposto narrativo. Se vuoi parlarne,
        scegli pure un social.
      </p>
      <div className={styles.icons}>
        <a href="#" className="btn" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" className="btn" aria-label="Twitter"><TwitterIcon /></a>
        <a href="#" className="btn" aria-label="TikTok"><TikTokIcon /></a>
      </div>
    </div>
  );
}
