import type { ReactNode } from 'react';
import type { FunnelGender } from '../data/copy';
import { eligibilityTitle, funnelCopy, getFunnelSubhead, transformationsCopy } from '../data/copy';
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

  const highlight = transformationsCopy.headlineHighlight;
  const headlineParts = transformationsCopy.headline.split(highlight);

  return (
    <main className="page-main">
      <PageHero
        headline={funnelCopy.headline}
        headlineHighlight={funnelCopy.headlineHighlight}
        headlineUnderline={funnelCopy.headlineUnderline}
        subhead={getFunnelSubhead(icpGender)}
      />
      <div className="container">
        <VSLPlayer gender={icpGender} />
        <h2 className="funnel-eligibility-title">{eligibilityTitle}</h2>
        <ApplicationForm />
        {children}
      </div>
      <section className="funnel-transformations" aria-labelledby="funnel-transformations-heading">
        <p className="funnel-transformations-eyebrow">{transformationsCopy.eyebrow}</p>
        <h2 id="funnel-transformations-heading" className="funnel-transformations-headline">
          {headlineParts[0]}
          <span className="funnel-transformations-highlight">{highlight}</span>
          {headlineParts[1]}
        </h2>
        <p className="funnel-transformations-subhead">{transformationsCopy.subhead}</p>
        <div className="testimonial-banners">{scrollingBanners}</div>
        {afterBanner ? <div className="container">{afterBanner}</div> : null}
      </section>
      <ExclusiveProgram icpGender={icpGender} />
      <FounderManifesto />
      <div className="container">
        <FinalCTA />
      </div>
      <StickyApplyBar />
    </main>
  );
}
