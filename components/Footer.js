import { InstagramIcon, TwitterIcon, TikTokIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="icons">
        <a href="#" className="btn" aria-label="Instagram">
          <InstagramIcon />
        </a>
        <a href="#" className="btn" aria-label="Twitter">
          <TwitterIcon />
        </a>
        <a href="#" className="btn" aria-label="TikTok">
          <TikTokIcon />
        </a>
      </div>
      <span className="copy">evolve srls</span>
    </footer>
  );
}
