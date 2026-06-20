import { Link } from 'react-router-dom';
import { socialLinks } from '../data/social';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner container">
        <nav className="site-footer-social" aria-label="Social media">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <nav className="site-footer-legal" aria-label="Legal">
          <Link to="/terms">Terms</Link>
          <span className="site-footer-divider" aria-hidden="true">
            ·
          </span>
          <Link to="/privacy">Privacy</Link>
          <span className="site-footer-divider" aria-hidden="true">
            ·
          </span>
          <Link to="/disclaimer">Disclaimer</Link>
        </nav>
        <p className="site-footer-copy">© {year} Swolekol LLC</p>
      </div>
    </footer>
  );
}
