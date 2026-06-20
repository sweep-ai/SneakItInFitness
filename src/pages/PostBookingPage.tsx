import type { ReactNode } from 'react';
import { VSLPlayer } from '../components/VSLPlayer';
import { PrepChecklist } from '../components/PrepChecklist';
import { FAQ } from '../components/FAQ';
import { ConfirmAppointment } from '../components/ConfirmAppointment';
import { postBookingCopy } from '../data/copy';
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

  return (
    <main className="page-main">
      <div className="container">
        <header className="post-booking-intro">
          <h1 className="post-booking-headline">
            <span className="post-booking-congrats">{postBookingCopy.congratsLabel}</span>{' '}
            {postBookingCopy.headline}
          </h1>
        </header>

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

        <PostBookingStep label={steps.faq.label} prompt={steps.faq.prompt}>
          <FAQ hideTitle />
        </PostBookingStep>

        <PostBookingStep label={steps.confirm.label} prompt={steps.confirm.prompt}>
          <ConfirmAppointment />
        </PostBookingStep>

        <PostBookingStep label={steps.prep.label} prompt={steps.prep.prompt}>
          <PrepChecklist hideTitle />
        </PostBookingStep>
      </div>
    </main>
  );
}
