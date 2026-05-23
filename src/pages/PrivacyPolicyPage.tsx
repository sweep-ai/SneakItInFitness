import { Link } from 'react-router-dom';
import './LegalDocument.css';

export function PrivacyPolicyPage() {
  return (
    <main className="page-main legal-page">
      <div className="container">
        <header className="legal-header">
          <h1>Privacy Policy</h1>
          <p className="subhead">Last updated: May 20, 2026</p>
        </header>

        <div className="legal-content">
          <section>
            <h2>Who we are</h2>
            <p>
              This website promotes the Sneak-it-in System, a 1:1 online fitness coaching
              program operated by Ari Sokol (Swolekol LLC). When this policy says &quot;we,&quot;
              &quot;us,&quot; or &quot;our,&quot; it refers to Swolekol LLC and Ari Sokol as the
              operator of this site.
            </p>
          </section>

          <section>
            <h2>What this site collects</h2>
            <p>
              This website is a marketing and booking funnel. We do not run account sign ups,
              checkout, or contact forms on this site itself. We do not intentionally collect
              your name, email, or payment details directly through our own forms on these
              pages.
            </p>
            <p>
              When you book a strategy call, you enter your information on Calendly&apos;s
              scheduling page (embedded on our booking page). That data is collected and
              processed by Calendly under their privacy policy, not stored by us on this
              website.
            </p>
          </section>

          <section>
            <h2>Third-party services</h2>
            <p>
              Parts of this site load content and tools from other companies. Those services
              may collect technical data (such as IP address, device type, and usage data)
              according to their own policies. Services used on this site include:
            </p>
            <ul>
              <li>
                <strong>Calendly</strong> for scheduling calls (
                <a
                  href="https://calendly.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Calendly Privacy Notice
                </a>
                )
              </li>
              <li>
                <strong>YouTube</strong> for embedded video (
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Loom</strong> for embedded pre-call video (
                <a
                  href="https://www.loom.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Loom Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>Vercel</strong> (or similar hosting) to deliver the website securely
              </li>
            </ul>
            <p>
              Embedded videos and schedulers may set cookies or use similar technologies when
              you interact with them. We recommend reviewing each provider&apos;s policy if
              you want more detail.
            </p>
          </section>

          <section>
            <h2>How we use information</h2>
            <p>
              Information you provide through Calendly is used to schedule and conduct your
              strategy call, follow up about coaching if you move forward, and communicate
              about your booking. We do not sell your personal information.
            </p>
            <p>
              If you DM or follow us on social media, those platforms handle your data under
              their own rules. Our public profiles:
            </p>
            <ul>
              <li>
                <a
                  href="https://www.instagram.com/swolekol/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram @swolekol
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@Swolekol"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube @Swolekol
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2>Sharing</h2>
            <p>
              We share information only as needed to run this site and coaching business: with
              service providers (such as Calendly, email, and hosting), when required by law,
              or when you ask us to. We do not share your data for unrelated third-party
              marketing.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              You can cancel or reschedule through your Calendly confirmation email. You may
              request access, correction, or deletion of personal information we hold from a
              booking by contacting us on Instagram{' '}
              <a
                href="https://www.instagram.com/swolekol/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @swolekol
              </a>
              . We will respond within a reasonable time.
            </p>
            <p>
              You can limit embedded content by not playing videos until you choose to, and
              by adjusting cookie settings in your browser where applicable.
            </p>
          </section>

          <section>
            <h2>Security and retention</h2>
            <p>
              We use reputable third-party tools and hosting to reduce risk. No method of
              transmission over the internet is 100% secure. We keep booking-related
              information only as long as needed for scheduling, coaching operations, and
              legal obligations.
            </p>
          </section>

          <section>
            <h2>Children</h2>
            <p>
              This site and coaching program are intended for adults. We do not knowingly
              collect personal information from anyone under 18. If you believe a minor
              submitted data through our booking flow, contact us and we will work to delete
              it.
            </p>
          </section>

          <section>
            <h2>Changes</h2>
            <p>
              We may update this policy as the site or services change. The &quot;Last
              updated&quot; date at the top will reflect the latest version. Continued use of
              the site after changes means you accept the updated policy.
            </p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>
              Questions about this policy or your data: message{' '}
              <a
                href="https://www.instagram.com/swolekol/"
                target="_blank"
                rel="noopener noreferrer"
              >
                @swolekol on Instagram
              </a>
              . See also our <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/disclaimer">Disclaimer</Link>.
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
