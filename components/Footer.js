import { InstagramIcon, TwitterIcon, TikTokIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="icons">
        <a href="#" aria-label="Instagram"><InstagramIcon /></a>
        <a href="#" aria-label="Twitter"><TwitterIcon /></a>
        <a href="#" aria-label="TikTok"><TikTokIcon /></a>
      </div>
      <span className="copy">evolve srls</span>
    </footer>
  );
}
