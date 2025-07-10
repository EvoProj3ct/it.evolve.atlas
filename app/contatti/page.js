import './page.css';
import { InstagramIcon, TwitterIcon, TikTokIcon } from '@/components/Icons';

export const metadata = {
  title: 'Contatti',
};

export default function Contatti() {
  return (
    <div className="contact">
      <h1 className="title">Contattaci</h1>
      <p className="description">
        Questa pagina sa di essere solo un segnaposto narrativo. Se vuoi parlarne,
        scegli pure un social.
      </p>
      <div className="icons">
        <a href="#" className="btn" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" className="btn" aria-label="Twitter"><TwitterIcon /></a>
        <a href="#" className="btn" aria-label="TikTok"><TikTokIcon /></a>
      </div>
    </div>
  );
}
