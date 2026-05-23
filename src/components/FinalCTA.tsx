import { finalCtaCopy } from '../data/copy';
import { ApplyButton } from './ApplyButton';
import './FinalCTA.css';

export function FinalCTA() {
  return (
    <section className="final-cta section" aria-labelledby="final-cta-heading">
      <h2 id="final-cta-heading" className="final-cta-headline">
        {finalCtaCopy.headline}
      </h2>
      <p className="final-cta-subhead">{finalCtaCopy.subhead}</p>
      <ApplyButton />
    </section>
  );
}
