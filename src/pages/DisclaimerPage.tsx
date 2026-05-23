import { Link } from 'react-router-dom';
import './LegalDocument.css';

export function DisclaimerPage() {
  return (
    <main className="page-main legal-page">
      <div className="container">
        <header className="legal-header">
          <h1>Disclaimer</h1>
          <p className="subhead">Last updated: May 20, 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>General</h2>
            <p>
              The information on this website, in videos, and on strategy calls with Ari
              Sokol and Swolekol LLC is for general fitness and education purposes only. It
              is not medical advice, mental health treatment, or a substitute for care from a
              licensed physician or other qualified provider.
            </p>
          </section>

          <section>
            <h2>Consult your doctor</h2>
            <p>
              Always talk to your doctor before starting a new diet, exercise program, or
              supplement routine. Stop and seek medical help if you feel pain, dizziness,
              chest discomfort, or any unusual symptoms. You assume full responsibility for
              your health choices.
            </p>
          </section>

          <section>
            <h2>No guaranteed results</h2>
            <p>
              Fitness results vary. Weight loss, strength, body composition, and confidence
              depend on your starting point, consistency, sleep, stress, nutrition, and many
              factors outside our control. We do not promise specific outcomes, timelines, or
              earnings from coaching.
            </p>
          </section>

          <section>
            <h2>Testimonials and client stories</h2>
            <p>
              Photos, videos, and stats shown on this site (including before/after images and
              weight loss figures) reflect real client experiences. They are not typical for
              everyone and are not a guarantee you will achieve the same results. Client
              stories are shared with permission and may be edited for length or clarity.
            </p>
          </section>

          <section>
            <h2>Educational content</h2>
            <p>
              Videos, including embedded YouTube and Loom content, represent opinions and
              coaching philosophy at the time they were recorded. Nutrition and training
              guidance is general and must be adapted to your body, culture, schedule, and
              medical needs.
            </p>
          </section>

          <section>
            <h2>Affiliate and external links</h2>
            <p>
              This site may link to third-party websites or tools (such as Calendly,
              Instagram, or YouTube). We are not responsible for content, policies, or
              practices on sites we do not control.
            </p>
          </section>

          <section>
            <h2>Professional relationship</h2>
            <p>
              Using this website or booking a strategy call does not create a coach-client
              relationship until a separate coaching agreement is signed and payment terms are
              accepted, if applicable. Strategy calls are for exploration and fit, not
              ongoing coaching unless you enroll.
            </p>
          </section>

          <section>
            <h2>Limitation</h2>
            <p>
              To the fullest extent permitted by law, Swolekol LLC and Ari Sokol are not
              liable for any injury, loss, or damage related to reliance on site content or
              participation in fitness activities. Use the information here at your own risk.
            </p>
            <p>
              For site use terms, see our <Link to="/terms">Terms of Service</Link>. For
              data practices, see our <Link to="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this disclaimer: message{' '}
              <a
                href="https://www.instagram.com/swolekol/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @swolekol on Instagram
              </a>
              .
            </p>
          </section>
        </div>

        <p className="legal-back">
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </main>
  );
}
