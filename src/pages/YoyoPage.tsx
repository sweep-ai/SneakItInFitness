import { yoyoFunnelCopy } from '../data/copy';
import { FunnelShell } from '../components/FunnelShell';

export function YoyoPage() {
  return (
    <FunnelShell
      copy={yoyoFunnelCopy}
      bannerMode="both"
      showGenderLinks
      genderLinkMale="/male/yoyo"
      genderLinkFemale="/female/yoyo"
    />
  );
}
