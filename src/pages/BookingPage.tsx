import { useEffect } from 'react';
import { CalendlyEmbed } from '../components/CalendlyEmbed';
import { ScrollingBanner } from '../components/ScrollingBanner';
import { bookingCopy } from '../data/copy';
import { menTestimonials, womenTestimonials } from '../data/assets';
import { trackLead } from '../lib/metaPixel';
import {
  consumePendingLeadEventId,
  getStoredApplicantUserData,
} from '../lib/conversionTracking';
import '../components/FunnelShell.css';
import './BookingPage.css';

export function BookingPage() {
  useEffect(() => {
    // Reliable Lead confirmation: only fires when the visitor actually reaches
    // /booking after submitting, reusing the submit event_id so Meta dedupes.
    const leadEventId = consumePendingLeadEventId();
    if (leadEventId) {
      trackLead(getStoredApplicantUserData(), leadEventId);
    }
  }, []);

  const { education } = bookingCopy;

  return (
    <main className="page-main">
      <div className="container">
        <header className="booking-page-header">
          <h1 className="booking-page-headline">
            <span className="booking-page-congrats">{bookingCopy.congratsLabel}</span>
            <span className="booking-page-title">{bookingCopy.headline}</span>
          </h1>
        </header>

        <section className="booking-education" aria-labelledby="booking-education-title">
          <h2 id="booking-education-title" className="booking-education-headline">
            {education.headline}
          </h2>
          <p className="booking-education-subhead">{education.subhead}</p>
          <ul className="booking-education-points">
            {education.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="booking-education-note">{education.note}</p>
          <a href="#booking-calendar" className="booking-education-cta">
            {education.cta}
          </a>
        </section>

        <div id="booking-calendar">
          <CalendlyEmbed />
        </div>
      </div>
      <section className="booking-banners" aria-label="Client transformations">
        <ScrollingBanner testimonials={menTestimonials} direction="left" />
        <ScrollingBanner testimonials={womenTestimonials} direction="right" />
      </section>
    </main>
  );
}
