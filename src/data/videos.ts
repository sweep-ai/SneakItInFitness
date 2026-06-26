import vslPoster from '../../assets/VSL-poster.jpg';
import vslVideo from '../../assets/VSL.mp4';
import type { FunnelGender } from './copy';

export type VideoPlacement = 'funnel' | 'postBooking';

export interface VideoConfig {
  provider: 'youtube' | 'loom' | 'file';
  youtubeId?: string;
  loomEmbedUrl?: string;
  src?: string;
  poster?: string;
  title: string;
  sectionLabel: string | null;
}

function loomEmbedUrl(shareId: string): string {
  return `https://www.loom.com/embed/${shareId}`;
}

const funnelVslConfig: VideoConfig = {
  provider: 'file',
  src: vslVideo,
  poster: vslPoster,
  title: 'Sneak-it-in System video',
  sectionLabel: null,
};

/** Men's funnel pages — hosted VSL. */
export const maleFunnelVideo: VideoConfig = funnelVslConfig;

/** Women's funnel pages — hosted VSL. */
export const femaleFunnelVideo: VideoConfig = funnelVslConfig;

/** Neutral home page — general-audience hosted VSL. */
export const neutralFunnelVideo: VideoConfig = funnelVslConfig;

export type FunnelVideoGender = FunnelGender | 'neutral';

export const funnelVideosByGender: Record<FunnelVideoGender, VideoConfig> = {
  male: maleFunnelVideo,
  female: femaleFunnelVideo,
  neutral: neutralFunnelVideo,
};

/** Post-booking page — Loom pre-call video (all funnel variants). */
export const postBookingVideo: VideoConfig = {
  provider: 'loom',
  loomEmbedUrl: loomEmbedUrl('6d9ef587dac6459fadbc8739f82ebad4'),
  title: 'Pre-call preparation video',
  sectionLabel: null,
};

export const videosByPlacement: Record<VideoPlacement, VideoConfig> = {
  funnel: maleFunnelVideo,
  postBooking: postBookingVideo,
};
