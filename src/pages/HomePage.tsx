import { funnelCopy } from '../data/copy';
import { FunnelShell } from '../components/FunnelShell';

export function HomePage() {
  return (
    <FunnelShell
      copy={funnelCopy.neutral}
      bannerMode="both"
      showGenderLinks
    />
  );
}
