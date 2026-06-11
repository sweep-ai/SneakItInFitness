import { Navigate, useParams } from 'react-router-dom';
import { menClientStories, womenClientStories } from '../data/assets';
import {
  funnelCopyByConcept,
  type FunnelConcept,
  type FunnelGender,
} from '../data/copy';
import { FunnelShell } from '../components/FunnelShell';
import { RealClientStories } from '../components/RealClientStories';

const VALID_CONCEPTS: FunnelConcept[] = ['cultural', 'work', 'systems', 'food', 'yoyo'];

function isFunnelConcept(value: string | undefined): value is FunnelConcept {
  return VALID_CONCEPTS.includes(value as FunnelConcept);
}

interface GenderFunnelPageProps {
  gender: FunnelGender;
}

export function GenderFunnelPage({ gender }: GenderFunnelPageProps) {
  const { concept: conceptParam } = useParams<{ concept: string }>();

  if (!isFunnelConcept(conceptParam)) {
    const fallback = gender === 'male' ? 'systems' : 'cultural';
    return <Navigate to={`/${gender}/${fallback}`} replace />;
  }

  const copy = funnelCopyByConcept[conceptParam][gender];
  const bannerMode = gender === 'male' ? 'men' : 'women';
  const stories = gender === 'male' ? menClientStories : womenClientStories;

  return (
    <FunnelShell
      copy={copy}
      bannerMode={bannerMode}
      gender={gender}
      afterBanner={<RealClientStories stories={stories} />}
    />
  );
}
