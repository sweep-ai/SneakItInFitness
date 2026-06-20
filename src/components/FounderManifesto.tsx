import { founderManifestoLines } from '../data/copy';
import { ariCompSrc } from '../data/assets';
import { ApplyButton } from './ApplyButton';
import './FounderManifesto.css';

export function FounderManifesto() {
  return (
    <section className="founder-manifesto" aria-labelledby="founder-manifesto-heading">
      <div className="founder-manifesto-inner">
        <div className="founder-manifesto-copy" id="founder-manifesto-heading">
          {founderManifestoLines.map((line) => (
            <p
              key={line.text}
              className={`founder-manifesto-line${line.emphasis ? ' founder-manifesto-line--emphasis' : ''}`}
            >
              {line.text}
            </p>
          ))}
        </div>

        <p className="founder-manifesto-tagline">
          A <span className="founder-manifesto-brand">Sneak-it-in</span> System{' '}
          <span className="founder-manifesto-tagline-strong">Built For Your Real Life</span>
        </p>

        <p className="founder-manifesto-signature">Ari Sokol</p>
        <p className="founder-manifesto-title">Founder &amp; Coach</p>

        <img
          src={ariCompSrc}
          alt="Ari Sokol on stage at a bodybuilding competition"
          className="founder-manifesto-photo"
          width={480}
          height={720}
          loading="lazy"
        />

        <ApplyButton />
      </div>
    </section>
  );
}
