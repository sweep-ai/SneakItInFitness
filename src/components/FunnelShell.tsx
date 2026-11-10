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
import { StickyApplyBar, scrollToApplicationForm } from './StickyApplyBar';
import { menTestimonials, proofFaces, womenTestimonials, type Testimonial } from '../data/assets';
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
  mobilePhoto?: string;
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
  mobilePhoto,
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
        mobilePhoto={mobilePhoto}
      >
      <div className="funnel-proof">
        <div className="funnel-proof-faces">
          {proofFaces.map((face, index) => (
            <img
              key={face.name}
              className={`funnel-proof-face${index === proofFaces.length - 1 ? ' funnel-proof-face--ring' : ''}`}
              src={face.src}
              alt=""
              style={{ objectPosition: face.position }}
              width={64}
              height={64}
            />
          ))}
        </div>
        <div className="funnel-proof-meta">
          <div className="funnel-proof-stars" aria-label="5 stars">
            {Array.from({ length: 5 }, (_, index) => (
              <svg key={index} className="funnel-proof-star" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M10 1.4l2.2 4.7 5.2.7-3.8 3.6.9 5.2L10 13.2 5.5 15.6l.9-5.2L2.6 6.8l5.2-.7L10 1.4z"
                />
              </svg>
            ))}
          </div>
          <p className="funnel-proof-copy">3,142 lbs lost across 200+ clients</p>
        </div>
      </div>
      </PageHero>
      <div className="container">
        <button
          type="button"
          className="funnel-apply-above-video-btn"
          onClick={scrollToApplicationForm}
        >
          Apply Now
        </button>
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
