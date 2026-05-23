import { PageHero } from '../components/PageHero';
import { LoomEmbed } from '../components/LoomEmbed';
import { PrepChecklist } from '../components/PrepChecklist';
import { FAQ } from '../components/FAQ';
import { postBookingCopy } from '../data/copy';

export function PostBookingPage() {
  return (
    <main className="page-main">
      <div className="container">
        <PageHero headline={postBookingCopy.headline} subhead={postBookingCopy.subhead} />
        <LoomEmbed />
        <PrepChecklist />
        <FAQ />
      </div>
    </main>
  );
}
