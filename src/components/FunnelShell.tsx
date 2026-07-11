import type { ReactNode } from 'react';
import type { FunnelGender } from '../data/copy';
import { funnelCopy, testimonialSectionTitle, getVslSectionLabel } from '../data/copy';
import { PageHero } from './PageHero';
import { VSLPlayer } from './VSLPlayer';
import { ApplicationForm } from './ApplicationForm';
import { FinalCTA } from './FinalCTA';
import { ExclusiveProgram } from './ExclusiveProgram';
import { FounderManifesto } from './FounderManifesto';
import { SectionTitle } from './SectionTitle';
import { ScrollingBanner } from './ScrollingBanner';
import { StickyApplyBar } from './StickyApplyBar';
import { menTestimonials, womenTestimonials } from '../data/assets';
import './FunnelShell.css';

interface FunnelShellProps {
  bannerMode: 'men' | 'women' | 'both';
  icpGender?: FunnelGender | 'neutral';
  children?: ReactNode;
  afterBanner?: ReactNode;
}

export function FunnelShell({
  bannerMode,
  icpGender: icpGenderProp,
  children,
  afterBanner,
}: FunnelShellProps) {
  const icpGender =
    icpGenderProp ??
    (bannerMode === 'men' ? 'male' : bannerMode === 'women' ? 'female' : 'neutral');

  const scrollingBanners =
    bannerMode === 'men' ? (
      <ScrollingBanner testimonials={menTestimonials} direction="left" />
    ) : bannerMode === 'women' ? (
      <ScrollingBanner testimonials={womenTestimonials} direction="right" />
    ) : (
      <>
        <ScrollingBanner testimonials={menTestimonials} direction="left" />
        <ScrollingBanner testimonials={womenTestimonials} direction="right" />
      </>
    );

  const testimonialSection = (
    <>
      <section className="section testimonial-section" aria-labelledby="testimonial-section-title">
        <div className="container">
          <SectionTitle id="testimonial-section-title">{testimonialSectionTitle}</SectionTitle>
        </div>
        <div className="testimonial-banners">{scrollingBanners}</div>
      </section>
      {afterBanner && <div className="container">{afterBanner}</div>}
    </>
  );

  return (
    <main className="page-main">
      <PageHero
        headline={funnelCopy.headline}
        headlineHighlight={funnelCopy.headlineHighlight}
        subhead={funnelCopy.subhead}
      />
      <div className="container">
        <VSLPlayer gender={icpGender} sectionLabel={getVslSectionLabel(icpGender)} />
      </div>
      <div className="container">
        <ApplicationForm />
        {children}
      </div>
      {testimonialSection}
      <ExclusiveProgram icpGender={icpGender} />
      <FounderManifesto />
      <div className="container">
        <FinalCTA />
      </div>
      <StickyApplyBar />
    </main>
  );
}
