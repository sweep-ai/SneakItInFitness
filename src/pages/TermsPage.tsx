import { Link } from 'react-router-dom';
import './LegalDocument.css';

export function TermsPage() {
  return (
    <main className="page-main legal-page">
      <div className="container">
        <header className="legal-header">
          <h1>Terms of Service</h1>
          <p className="subhead">Last updated: May 20, 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>Agreement</h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your use of this website and
              any strategy calls or coaching offered through Swolekol LLC and Ari Sokol
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By using this site or
              booking a call, you agree to these Terms. If you do not agree, do not use the
              site.
            </p>
          </section>

          <section>
            <h2>What this site provides</h2>
            <p>
              This website is for informational and marketing purposes. It describes the
              Sneak-it-in System, shares educational content, client stories, and allows you
              to book a strategy call. Nothing on this site is a binding offer to provide
              coaching until a separate written agreement is signed, if you choose to move
              forward.
            </p>
          </section>

          <section>
            <h2>Strategy calls</h2>
            <p>
              Strategy calls are conversations to discuss your goals, fit, and next steps.
              They are not medical visits, therapy, or emergency services. We may decline or
              end a call if it is abusive, off topic, or not a good fit. You are responsible
              for joining on time, with reliable internet, and in a private setting if you
              prefer confidentiality.
            </p>
          </section>

          <section>
            <h2>Coaching services</h2>
            <p>
              If you enroll in paid 1:1 coaching, separate coaching terms, payment terms, and
              cancellation policies will apply. Those terms control over anything general on
              this website. This site does not guarantee admission into coaching.
            </p>
          </section>

          <section>
            <h2>Not medical advice</h2>
            <p>
              We provide fitness and lifestyle coaching, not medical care. We do not
              diagnose, treat, or prescribe. Consult a physician before starting any exercise
              or nutrition program, especially if you have a medical condition, injury, or are
              pregnant. You participate at your own risk.
            </p>
            <p>
              See our <Link to="/disclaimer">Disclaimer</Link> for more on results and
              testimonials.
            </p>
          </section>

          <section>
            <h2>Your responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information when booking and on calls</li>
              <li>Use the site lawfully and not attempt to disrupt or scrape it</li>
              <li>Not copy, resell, or redistribute site content without permission</li>
              <li>Be at least 18 years old</li>
            </ul>
          </section>

          <section>
            <h2>Intellectual property</h2>
            <p>
              All content on this site, including text, videos, logos, and the Sneak-it-in
              name, is owned by Swolekol LLC or used with permission. You may view content for
              personal use only. You may not reproduce or exploit it commercially without
              written consent.
            </p>
          </section>

          <section>
            <h2>Third-party tools</h2>
            <p>
              Booking, video, and hosting are provided by third parties (such as Calendly,
              YouTube, and Loom). Your use of those tools is also subject to their terms. We
              are not responsible for outages or actions of third-party platforms.
            </p>
          </section>

          <section>
            <h2>Disclaimer of warranties</h2>
            <p>
              This site and any calls are provided &quot;as is&quot; without warranties of any
              kind, express or implied. We do not warrant uninterrupted access, error-free
              content, or specific outcomes from coaching.
            </p>
          </section>

          <section>
            <h2>Limitation of liability</h2>
            <p>
              To the fullest extent permitted by law, Swolekol LLC and Ari Sokol are not liable
              for indirect, incidental, special, or consequential damages arising from your
              use of the site or coaching, including lost profits or data. Our total
              liability for any claim related to the site or a free strategy call is limited
              to one hundred U.S. dollars ($100), except where law does not allow such
              limits.
            </p>
          </section>

          <section>
            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Swolekol LLC and Ari Sokol from claims
              arising from your misuse of the site, violation of these Terms, or injury
              resulting from your participation in fitness activities contrary to medical
              advice.
            </p>
          </section>

          <section>
            <h2>Governing law</h2>
            <p>
              These Terms are governed by the laws of the United States and the state in
              which Swolekol LLC is organized, without regard to conflict of law rules. Any
              dispute will be resolved in courts located in that state, unless otherwise
              required by law.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>
              We may update these Terms at any time. The date at the top shows the latest
              version. Continued use of the site after changes means you accept the updated
              Terms.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about these Terms: message{' '}
              <a
                href="https://www.instagram.com/swolekol/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @swolekol on Instagram
              </a>
              . See also our <Link to="/privacy">Privacy Policy</Link>.
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
