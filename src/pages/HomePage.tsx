import { allClientStories, ariHeaderSrc } from '../data/assets';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';
import { SimpleCheckWidget } from '../components/SimpleCheckWidget';
import { useFunnelPaths } from '../lib/funnelPaths';

export function HomePage() {
  const paths = useFunnelPaths();

  return (
    <FunnelShell
      bannerMode="both"
      icpGender="neutral"
      mobilePhoto={ariHeaderSrc}
      afterBanner={<RealClientStories stories={allClientStories} hideTitle />}
      formReplacement={paths.variant === 'schedule' ? <SimpleCheckWidget /> : undefined}
    />
  );
}
