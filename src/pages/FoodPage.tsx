import { foodFunnelCopy } from '../data/copy';
import { FunnelShell } from '../components/FunnelShell';

export function FoodPage() {
  return (
    <FunnelShell
      copy={foodFunnelCopy}
      bannerMode="both"
      showGenderLinks
      genderLinkMale="/male/food"
      genderLinkFemale="/female/food"
    />
  );
}
