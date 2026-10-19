import type { ReactNode } from 'react';
import type { FunnelCopy, IcpAudience } from '../data/copy';
import { eligibilityTitle, funnelCopy, getFunnelSubhead, transformationsCopy } from '../data/copy';
import { PageHero } from './PageHero';
import { VSLPlayer } from './VSLPlayer';
import { ApplicationForm } from './ApplicationForm';
import { FinalCTA } from './FinalCTA';
import { ExclusiveProgram } from './ExclusiveProgram';
import { FounderManifesto } from './FounderManifesto';
import { ScrollingBanner } from './ScrollingBanner';
import { StickyApplyBar } from './StickyApplyBar';
import { menTestimonials, womenTestimonials, type Testimonial } from '../data/assets';
import './FunnelShell.css';

interface FunnelShellProps {
  bannerMode: 'men' | 'women' | 'both';
  icpGender?: IcpAudience;
  children?: ReactNode;
  afterBanner?: ReactNode;
  heroCopy?: FunnelCopy;
  transformations?: typeof transformationsCopy;
  bannerTestimonials?: Testimonial[];
  heroPhotos?: string[];
}

export function FunnelShell({
  bannerMode,
  icpGender: icpGenderProp,
  children,
  afterBanner,
  heroCopy = funnelCopy,
  transformations = transformationsCopy,
  bannerTestimonials,
  heroPhotos,
}: FunnelShellProps) {
  const icpGender =
    icpGenderProp ??
    (bannerMode === 'men' ? 'male' : bannerMode === 'women' ? 'female' : 'neutral');

  const womenBannerItems = bannerTestimonials ?? womenTestimonials;
  const womenBannerKey = womenBannerItems.map((item) => `${item.name}:${item.stat}`).join('|');

  const scrollingBanners =
    bannerMode === 'men' ? (
      <ScrollingBanner testimonials={menTestimonials} direction="left" />
    ) : bannerMode === 'women' ? (
      <ScrollingBanner key={womenBannerKey} testimonials={womenBannerItems} direction="right" />
    ) : (
      <>
        <ScrollingBanner testimonials={menTestimonials} direction="left" />
        <ScrollingBanner key={womenBannerKey} testimonials={womenBannerItems} direction="right" />
      </>
    );

  const highlight = transformations.headlineHighlight;
  const headlineParts = transformations.headline.split(highlight);

  return (
    <main className="page-main">
      <PageHero
        headline={heroCopy.headline}
        headlineHighlight={heroCopy.headlineHighlight}
        headlineUnderline={heroCopy.headlineUnderline}
        subhead={getFunnelSubhead(icpGender)}
        photos={heroPhotos}
      />
      <div className="container">
        <VSLPlayer gender={icpGender} />
        <h2 className="funnel-eligibility-title">{eligibilityTitle}</h2>
        <ApplicationForm />
        {children}
      </div>
      <section className="funnel-transformations" aria-labelledby="funnel-transformations-heading">
        <p className="funnel-transformations-eyebrow">{transformations.eyebrow}</p>
        <h2 id="funnel-transformations-heading" className="funnel-transformations-headline">
          {headlineParts[0]}
          <span className="funnel-transformations-highlight">{highlight}</span>
          {headlineParts[1]}
        </h2>
        <p className="funnel-transformations-subhead">{transformations.subhead}</p>
        <div className="testimonial-banners">{scrollingBanners}</div>
        {afterBanner ? <div className="container">{afterBanner}</div> : null}
      </section>
      <ExclusiveProgram icpGender={icpGender} photos={heroPhotos} />
      <FounderManifesto />
      <div className="container">
        <FinalCTA />
      </div>
      <StickyApplyBar />
    </main>
  );
}
