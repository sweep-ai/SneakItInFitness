import { womenClientStories } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function FemalePage() {
  return (
    <FunnelShell
      bannerMode="women"
      icpGender="female"
      afterBanner={<RealClientStories stories={womenClientStories} />}
    />
  );
}
