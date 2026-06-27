import { menClientStories } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function MalePage() {
  return (
    <FunnelShell
      bannerMode="men"
      icpGender="male"
      afterBanner={<RealClientStories stories={menClientStories} />}
    />
  );
}
