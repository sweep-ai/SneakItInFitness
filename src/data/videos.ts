import type { FunnelGender } from './copy';

export type VideoPlacement = 'funnel' | 'postBooking';

export interface VideoConfig {
  provider: 'youtube' | 'loom' | 'file';
  youtubeId?: string;
  loomEmbedUrl?: string;
  src?: string;
  title: string;
  sectionLabel: string | null;
}

function loomEmbedUrl(shareId: string): string {
  return `https://www.loom.com/embed/${shareId}`;
}

/** Men's funnel pages — Loom VSL. */
export const maleFunnelVideo: VideoConfig = {
  provider: 'loom',
  loomEmbedUrl: loomEmbedUrl('102fb03a275749e9b5121329a798bdc1'),
  title: 'Sneak-it-in System video',
  sectionLabel: 'Learn The System',
};

/** Women's funnel pages — Loom VSL. */
export const femaleFunnelVideo: VideoConfig = {
  provider: 'loom',
  loomEmbedUrl: loomEmbedUrl('189dd947f75147be88567e59791313cd'),
  title: 'Sneak-it-in System video',
  sectionLabel: 'Learn The System',
};

export const funnelVideosByGender: Record<FunnelGender, VideoConfig> = {
  male: maleFunnelVideo,
  female: femaleFunnelVideo,
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
