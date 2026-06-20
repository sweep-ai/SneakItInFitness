import type { FunnelGender } from '../data/copy';
import { getIcpAudienceLabel } from '../data/copy';
import { ariHeaderSrc, heroBackgroundPhotos } from '../data/assets';
import './PageHero.css';

interface PageHeroProps {
  headline?: string;
  subhead: string;
  icpGender?: FunnelGender | 'neutral';
}

export function PageHero({ headline, subhead, icpGender }: PageHeroProps) {
  const gridPhotos = Array.from({ length: 48 }, (_, index) => heroBackgroundPhotos[index % heroBackgroundPhotos.length]);

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
          {icpGender ? (
            <>
              <p className="page-hero-icp-line">
                For{' '}
                <span className="page-hero-icp-emphasis">{getIcpAudienceLabel(icpGender)}</span>
              </p>
              <p className="page-hero-icp-line">looking for change</p>
            </>
          ) : (
            headline && <h1 className="page-hero-headline">{headline}</h1>
          )}
          <p className="page-hero-subhead">{subhead}</p>
        </div>

        <img
          src={ariHeaderSrc}
          alt=""
          className="page-hero-figure"
          width={480}
          height={640}
        />
      </div>
    </header>
  );
}
