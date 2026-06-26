import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FunnelCopy, FunnelGender } from '../data/copy';
import { testimonialSectionTitle, getVslSectionLabel } from '../data/copy';
import type { FunnelVideoGender } from '../data/videos';
import { PageHero } from './PageHero';
import { VSLPlayer } from './VSLPlayer';
import { ApplicationForm } from './ApplicationForm';
import { FinalCTA } from './FinalCTA';
import { ExclusiveProgram } from './ExclusiveProgram';
import { FounderManifesto } from './FounderManifesto';
import { SectionTitle } from './SectionTitle';
import { ScrollingBanner } from './ScrollingBanner';
import { menTestimonials, womenTestimonials } from '../data/assets';
import './FunnelShell.css';

interface FunnelShellProps {
  copy: FunnelCopy;
  bannerMode: 'men' | 'women' | 'both';
  gender?: FunnelGender;
  vslGender?: FunnelVideoGender;
  icpGender?: FunnelGender | 'neutral';
  heroMode?: 'headline' | 'icp';
  showGenderLinks?: boolean;
  genderLinkMale?: string;
  genderLinkFemale?: string;
  testimonialsBeforeForm?: boolean;
  children?: ReactNode;
  afterBanner?: ReactNode;
}

export function FunnelShell({
  copy,
  bannerMode,
  gender,
  vslGender,
  icpGender: icpGenderProp,
  heroMode = 'icp',
  showGenderLinks = false,
  genderLinkMale = '/male/systems',
  genderLinkFemale = '/female/cultural',
  testimonialsBeforeForm = false,
  children,
  afterBanner,
}: FunnelShellProps) {
  const icpGender =
    icpGenderProp ??
    gender ??
    (bannerMode === 'men' ? 'male' : bannerMode === 'women' ? 'female' : 'neutral');

  const resolvedVslGender = vslGender ?? gender ?? 'neutral';

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
        headline={heroMode === 'headline' ? copy.headline : undefined}
        icpGender={heroMode === 'headline' ? undefined : icpGender}
        subhead={copy.subhead}
      />
      <div className="container">
        {showGenderLinks && (
          <nav className="gender-links" aria-label="Gender-specific pages">
            <Link to={genderLinkMale}>Men&apos;s page</Link>
            <Link to={genderLinkFemale}>Women&apos;s page</Link>
          </nav>
        )}
        <VSLPlayer gender={resolvedVslGender} sectionLabel={getVslSectionLabel(icpGender)} />
      </div>
      {testimonialsBeforeForm && testimonialSection}
      <div className="container">
        <ApplicationForm />
        {children}
      </div>
      {!testimonialsBeforeForm && testimonialSection}
      <ExclusiveProgram icpGender={icpGender} />
      <FounderManifesto />
      <div className="container">
        <FinalCTA />
      </div>
    </main>
  );
}
