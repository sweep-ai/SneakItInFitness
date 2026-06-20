import { meetingConfirmSrc, meetingLinkSrc } from '../data/assets';
import './ConfirmAppointment.css';

export function ConfirmAppointment() {
  return (
    <div className="confirm-appointment">
      <p className="confirm-appointment-lead">
        Open the calendar invite in your email and tap <strong>Yes</strong> to confirm your
        appointment.
      </p>

      <figure className="confirm-appointment-figure">
        <img
          src={meetingConfirmSrc}
          alt="Google Calendar invite showing Yes, No, and Maybe RSVP buttons"
          className="confirm-appointment-img"
          loading="lazy"
        />
        <figcaption>Tap &ldquo;Yes&rdquo; on your calendar invite to confirm.</figcaption>
      </figure>

      <p className="confirm-appointment-lead">
        Your Google Meet link will be in the event description. Save it so you can join on call day.
      </p>

      <figure className="confirm-appointment-figure">
        <img
          src={meetingLinkSrc}
          alt="Calendar event description with Google Meet conference link"
          className="confirm-appointment-img"
          loading="lazy"
        />
        <figcaption>Find your Google Meet link in the event details.</figcaption>
      </figure>
    </div>
  );
}
