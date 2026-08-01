import { heroBackgroundPhotos } from '../data/assets';
import './PageHero.css';

interface PageHeroProps {
  headline: string;
  headlineHighlight?: string;
  subhead: string;
}

export function PageHero({ headline, headlineHighlight, subhead }: PageHeroProps) {
  const gridPhotos = Array.from({ length: 24 }, (_, index) => heroBackgroundPhotos[index % heroBackgroundPhotos.length]);

  return (
    <header className="page-hero">
      <div className="page-hero-bg" aria-hidden="true">
        <div className="page-hero-photo-grid">
          {gridPhotos.map((src, index) => (
            <img key={`${src}-${index}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
        <div className="page-hero-overlay" />
      </div>

      <div className="page-hero-inner">
        <div className="page-hero-copy">
          <h1 className="page-hero-headline">
            {headlineHighlight && headline.includes(headlineHighlight) ? (
              <>
                {headline.slice(0, headline.indexOf(headlineHighlight))}
                <span className="page-hero-headline-emphasis">{headlineHighlight}</span>
                {headline.slice(
                  headline.indexOf(headlineHighlight) + headlineHighlight.length
                )}
              </>
            ) : (
              headline
            )}
          </h1>
          <p className="page-hero-subhead">{subhead}</p>
        </div>
      </div>
    </header>
  );
}
