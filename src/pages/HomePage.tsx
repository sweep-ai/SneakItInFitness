import { allClientStories } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function HomePage() {
  return (
    <FunnelShell
      bannerMode="both"
      icpGender="neutral"
      afterBanner={<RealClientStories stories={allClientStories} />}
    />
  );
}
