import { allClientStories, ariHeaderSrc } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function HomePage() {
  return (
    <FunnelShell
      bannerMode="both"
      icpGender="neutral"
      mobilePhoto={ariHeaderSrc}
      afterBanner={<RealClientStories stories={allClientStories} hideTitle />}
    />
  );
}
