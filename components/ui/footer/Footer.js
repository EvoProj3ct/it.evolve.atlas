// Footer.tsx (o .jsx)
import { InstagramIcon, TwitterIcon, TikTokIcon } from '../../Icons';
import styles from './FooterStyles.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.icons}>
                <a
                    href="https://www.instagram.com/evolve3dcompany/"
                    className={styles.btn}
                    aria-label="Instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <InstagramIcon />
                </a>
                <a href="#" className={styles.btn} aria-label="Twitter">
                    <TwitterIcon />
                </a>
                <a href="#" className={styles.btn} aria-label="TikTok">
                    <TikTokIcon />
                </a>
            </div>

            <span className={styles.copy}>Evolve SRLS - P.IVA 12345678901</span>
            <span className={styles.copy}>infoevolvecompany@gmail.com</span>
        </footer>
    );
}
