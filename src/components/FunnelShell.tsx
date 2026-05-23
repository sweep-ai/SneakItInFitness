import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FunnelCopy } from '../data/copy';
import { testimonialSectionTitle } from '../data/copy';
import { PageHero } from './PageHero';
import { VSLPlayer } from './VSLPlayer';
import { ApplyButton } from './ApplyButton';
import { FinalCTA } from './FinalCTA';
import { SectionTitle } from './SectionTitle';
import { ScrollingBanner } from './ScrollingBanner';
import { menTestimonials, womenTestimonials } from '../data/assets';
import './FunnelShell.css';

interface FunnelShellProps {
  copy: FunnelCopy;
  bannerMode: 'men' | 'women' | 'both';
  showGenderLinks?: boolean;
  children?: ReactNode;
  afterBanner?: ReactNode;
}

export function FunnelShell({
  copy,
  bannerMode,
  showGenderLinks = false,
  children,
  afterBanner,
}: FunnelShellProps) {

  return (
    <main className="page-main">
      <div className="container">
        <PageHero headline={copy.headline} subhead={copy.subhead} />
        {showGenderLinks && (
          <nav className="gender-links" aria-label="Gender-specific pages">
            <Link to="/male/systems">Men&apos;s page</Link>
            <Link to="/female/cultural">Women&apos;s page</Link>
          </nav>
        )}
        <VSLPlayer />
        <ApplyButton />
        {children}
        <section className="section testimonial-section">
          <SectionTitle>{testimonialSectionTitle}</SectionTitle>
          {bannerMode === 'men' && (
            <ScrollingBanner testimonials={menTestimonials} direction="left" />
          )}
          {bannerMode === 'women' && (
            <ScrollingBanner testimonials={womenTestimonials} direction="left" />
          )}
          {bannerMode === 'both' && (
            <div className="dual-banners">
              <ScrollingBanner testimonials={menTestimonials} direction="left" />
              <ScrollingBanner testimonials={womenTestimonials} direction="right" />
            </div>
          )}
        </section>
        {afterBanner}
        <FinalCTA />
      </div>
    </main>
  );
}
