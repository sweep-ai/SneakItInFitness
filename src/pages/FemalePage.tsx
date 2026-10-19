import {
  menopauseClientStories,
  menopauseHeroPhotos,
  menopauseTestimonials,
} from '../data/assets';
import { menopauseFunnelCopy, menopauseTransformationsCopy } from '../data/copy';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

export function FemalePage() {
  return (
    <FunnelShell
      bannerMode="women"
      icpGender="menopausal"
      heroCopy={menopauseFunnelCopy}
      transformations={menopauseTransformationsCopy}
      bannerTestimonials={menopauseTestimonials}
      heroPhotos={menopauseHeroPhotos}
      afterBanner={<RealClientStories stories={menopauseClientStories} hideTitle />}
    />
  );
}
