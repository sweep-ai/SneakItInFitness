import { useEffect, type ReactNode } from 'react';
import { VSLPlayer } from '../components/VSLPlayer';
import { PrepChecklist } from '../components/PrepChecklist';
import { FAQ } from '../components/FAQ';
import { ConfirmAppointment } from '../components/ConfirmAppointment';
import { postBookingCopy } from '../data/copy';
import { trackSchedule } from '../lib/metaPixel';
import {
  consumePendingScheduleEventId,
  getStoredApplicantUserData,
} from '../lib/conversionTracking';
import './PostBookingPage.css';

interface PostBookingStepProps {
  label: string;
  prompt: string;
  children: ReactNode;
}

function PostBookingStep({ label, prompt, children }: PostBookingStepProps) {
  return (
    <section className="post-booking-step-section">
      <p className="post-booking-step">{label}</p>
      <p className="post-booking-step-prompt">{prompt}</p>
      {children}
    </section>
  );
}

export function PostBookingPage() {
  const { steps } = postBookingCopy;

  useEffect(() => {
    // Reliable Schedule confirmation: fires only when the booked visitor reaches
    // /post-booking, reusing the Calendly event_id so Meta dedupes. A direct
    // visit / refresh has no pending id, so it won't count as a new booking.
    const scheduleEventId = consumePendingScheduleEventId();
    if (scheduleEventId) {
      trackSchedule(getStoredApplicantUserData(), scheduleEventId);
    }
  }, []);

  return (
    <main className="page-main">
      <div className="container">
        <header className="post-booking-intro">
          <h1 className="post-booking-headline">{postBookingCopy.headline}</h1>
          <p className="post-booking-subheader">
            <span className="post-booking-mandatory">{postBookingCopy.subheader.highlight}</span>
            {postBookingCopy.subheader.rest}
          </p>
        </header>

        <section className="post-booking-preface" aria-label="Welcome video">
          <VSLPlayer placement="postBookingPreface" />
        </section>

        <PostBookingStep label={steps.intro.label} prompt={steps.intro.prompt}>
          <p className="post-booking-callout">
            You&apos;re going to{' '}
            <span className="post-booking-underline">receive a call</span> from{' '}
            <a href={`tel:${postBookingCopy.phoneNumber.replace(/\D/g, '')}`} className="post-booking-phone">
              {postBookingCopy.phoneNumber}
            </a>{' '}
            within the <span className="post-booking-underline">next 24 hours</span> to{' '}
            <span className="post-booking-underline">confirm your call</span>
          </p>
        </PostBookingStep>

        <PostBookingStep label={steps.video.label} prompt={steps.video.prompt}>
          <VSLPlayer placement="postBooking" />
        </PostBookingStep>

        <PostBookingStep label={steps.confirm.label} prompt={steps.confirm.prompt}>
          <ConfirmAppointment />
        </PostBookingStep>

        <PostBookingStep label={steps.faq.label} prompt={steps.faq.prompt}>
          <FAQ hideTitle />
        </PostBookingStep>

        <PostBookingStep label={steps.prep.label} prompt={steps.prep.prompt}>
          <PrepChecklist hideTitle />
        </PostBookingStep>
      </div>
    </main>
  );
}
