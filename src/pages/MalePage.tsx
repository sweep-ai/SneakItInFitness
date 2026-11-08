import { menClientStories, ariHeaderSrc } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function MalePage() {
  return (
    <FunnelShell
      bannerMode="men"
      icpGender="male"
      mobilePhoto={ariHeaderSrc}
      afterBanner={<RealClientStories stories={menClientStories} hideTitle />}
    />
  );
}
