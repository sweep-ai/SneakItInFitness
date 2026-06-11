import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FunnelCopy, FunnelGender } from '../data/copy';
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
  gender?: FunnelGender;
  showGenderLinks?: boolean;
  genderLinkMale?: string;
  genderLinkFemale?: string;
  children?: ReactNode;
  afterBanner?: ReactNode;
}

export function FunnelShell({
  copy,
  bannerMode,
  gender,
  showGenderLinks = false,
  genderLinkMale = '/male/systems',
  genderLinkFemale = '/female/cultural',
  children,
  afterBanner,
}: FunnelShellProps) {

  return (
    <main className="page-main">
      <div className="container">
        <PageHero headline={copy.headline} subhead={copy.subhead} />
        {showGenderLinks && (
          <nav className="gender-links" aria-label="Gender-specific pages">
            <Link to={genderLinkMale}>Men&apos;s page</Link>
            <Link to={genderLinkFemale}>Women&apos;s page</Link>
          </nav>
        )}
        <VSLPlayer gender={gender} />
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
