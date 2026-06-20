import type { FunnelGender } from '../data/copy';
import { getExclusiveProgramAudiencePhrase } from '../data/copy';
import { ariMomSrc, heroBackgroundPhotos } from '../data/assets';
import { ApplyButton } from './ApplyButton';
import './ExclusiveProgram.css';

interface ExclusiveProgramProps {
  icpGender?: FunnelGender | 'neutral';
}

export function ExclusiveProgram({ icpGender }: ExclusiveProgramProps) {
  const gridPhotos = Array.from(
    { length: 40 },
    (_, index) => heroBackgroundPhotos[index % heroBackgroundPhotos.length]
  );

  return (
    <section className="exclusive-program" aria-labelledby="exclusive-program-heading">
      <div className="exclusive-program-bg" aria-hidden="true">
        <div className="exclusive-program-photo-grid">
          {gridPhotos.map((src, index) => (
            <img key={`${src}-${index}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
        <div className="exclusive-program-overlay" />
      </div>

      <div className="exclusive-program-inner">
        <img
          src={ariMomSrc}
          alt="Ari Sokol with his mom"
          className="exclusive-program-photo"
          width={720}
          height={480}
        />

        <h2 id="exclusive-program-heading" className="exclusive-program-headline">
          <span>Not For Everyone</span>
          <span>By Design</span>
        </h2>

        <p className="exclusive-program-body">
          <span className="exclusive-program-brand">Sneak-it-in</span> is an{' '}
          <span className="exclusive-program-exclusive">exclusive</span> program for{' '}
          <strong>{getExclusiveProgramAudiencePhrase(icpGender)}.</strong>
        </p>

        <ApplyButton variant="inverse" />

        <p className="exclusive-program-footer">
          <strong>Spots are limited</strong> - entry is by application only
        </p>
      </div>
    </section>
  );
}
