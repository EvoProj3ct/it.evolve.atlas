import { InstagramIcon, TwitterIcon, TikTokIcon } from '@/components/Icons';

export const metadata = {
  title: 'Contatti',
};

export default function Contatti() {
  return (
    <div className="contact">
      <h1 className="title">Contattaci</h1>
      <p className="description">
        Vuoi saperne di più? Scrivici a infoevolvecompany@gmail.com o seguici sui
        nostri social.
      </p>
      <div className="icons">
        <a href="#" className="btn" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" className="btn" aria-label="Twitter"><TwitterIcon /></a>
        <a href="#" className="btn" aria-label="TikTok"><TikTokIcon /></a>
      </div>
    </div>
  );
}
