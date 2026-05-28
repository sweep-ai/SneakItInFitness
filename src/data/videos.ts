import vslSrc from '../../assets/VSL.mp4';

export type VideoPlacement = 'funnel' | 'postBooking';

export interface VideoConfig {
  provider: 'youtube' | 'loom' | 'file';
  youtubeId?: string;
  loomEmbedUrl?: string;
  src?: string;
  title: string;
  sectionLabel: string | null;
}

/** Main funnel pages — hosted VSL. */
export const funnelVideo: VideoConfig = {
  provider: 'file',
  src: vslSrc,
  title: 'Sneak-it-in System video',
  sectionLabel: 'Learn The System',
};

/** Post-booking page — YouTube VSL (swapped from main funnel). */
export const postBookingVideo: VideoConfig = {
  provider: 'youtube',
  youtubeId: 'Q7arXH-jGyU',
  title: 'Pre-call preparation video',
  sectionLabel: null,
};

export const videosByPlacement: Record<VideoPlacement, VideoConfig> = {
  funnel: funnelVideo,
  postBooking: postBookingVideo,
};
