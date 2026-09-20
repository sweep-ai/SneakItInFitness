import type { ReactNode } from 'react';
import type { FunnelGender } from '../data/copy';
import { funnelCopy, getFunnelSubhead } from '../data/copy';
import { PageHero } from './PageHero';
import { VSLPlayer } from './VSLPlayer';
import { ApplicationForm } from './ApplicationForm';
import { FinalCTA } from './FinalCTA';
import { ExclusiveProgram } from './ExclusiveProgram';
import { FounderManifesto } from './FounderManifesto';
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

  const testimonialSection = afterBanner ? (
    <div className="container">{afterBanner}</div>
  ) : null;

  return (
    <main className="page-main">
      <PageHero
        headline={funnelCopy.headline}
        headlineHighlight={funnelCopy.headlineHighlight}
        subhead={getFunnelSubhead(icpGender)}
      />
      <div className="container">
        <VSLPlayer gender={icpGender} />
        <div className="pre-form-scroll-cta">
          <a href="#application-form" className="pre-form-scroll-btn">
            Apply After Watching ↓
          </a>
        </div>
      </div>
      <div className="pre-form-social-proof">
        <div className="testimonial-banners">{scrollingBanners}</div>
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
