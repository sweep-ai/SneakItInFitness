import { funnelCopy } from '../data/copy';
import { allClientStories } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function HomePage() {
  return (
    <FunnelShell
      copy={funnelCopy.neutral}
      bannerMode="both"
      heroMode="headline"
      icpGender="neutral"
      vslGender="neutral"
      afterBanner={<RealClientStories stories={allClientStories} />}
    />
  );
}
