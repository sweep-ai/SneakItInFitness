import { PageHero } from '../components/PageHero';
import { CalendlyEmbed } from '../components/CalendlyEmbed';
import { ScrollingBanner } from '../components/ScrollingBanner';
import { bookingCopy } from '../data/copy';
import { menTestimonials, womenTestimonials } from '../data/assets';
import '../components/FunnelShell.css';

export function BookingPage() {
  return (
    <main className="page-main">
      <div className="container">
        <PageHero headline={bookingCopy.headline} subhead={bookingCopy.subhead} />
        <CalendlyEmbed />
      </div>
      <section className="booking-banners" aria-label="Client transformations">
        <ScrollingBanner testimonials={menTestimonials} direction="left" />
        <ScrollingBanner testimonials={womenTestimonials} direction="right" />
      </section>
    </main>
  );
}
