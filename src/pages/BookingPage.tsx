import { CalendlyEmbed } from '../components/CalendlyEmbed';
import { ScrollingBanner } from '../components/ScrollingBanner';
import { bookingCopy } from '../data/copy';
import { menTestimonials, womenTestimonials } from '../data/assets';
import '../components/FunnelShell.css';
import './BookingPage.css';

export function BookingPage() {
  return (
    <main className="page-main">
      <div className="container">
        <header className="booking-page-header">
          <h1 className="booking-page-headline">
            <span className="booking-page-step">{bookingCopy.stepLabel}:</span>{' '}
            {bookingCopy.headline}
          </h1>
        </header>
        <CalendlyEmbed />
      </div>
      <section className="booking-banners" aria-label="Client transformations">
        <ScrollingBanner testimonials={menTestimonials} direction="left" />
        <ScrollingBanner testimonials={womenTestimonials} direction="right" />
      </section>
    </main>
  );
}
