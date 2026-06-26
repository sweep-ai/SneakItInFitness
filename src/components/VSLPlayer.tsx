import { useEffect, useRef, useState } from 'react';
import type { FunnelVideoGender, VideoPlacement } from '../data/videos';
import { funnelVideosByGender, postBookingVideo } from '../data/videos';
import './VSLPlayer.css';

function PlayButton() {
  return (
    <span className="vsl-player-play" aria-hidden="true">
      <svg viewBox="0 0 68 48" width="68" height="48">
        <path
          d="M66.52 7.74a8 8 0 0 0-5.64-5.66C55.3 1 34 1 34 1s-21.3 0-26.88 1.08a8 8 0 0 0-5.64 5.66A83.27 83.27 0 0 0 1 24a83.27 83.27 0 0 0 1.48 16.26 8 8 0 0 0 5.64 5.66C12.7 47 34 47 34 47s21.3 0 26.88-1.08a8 8 0 0 0 5.64-5.66A83.27 83.27 0 0 0 67 24a83.27 83.27 0 0 0-1.48-16.26z"
          fill="#D70000"
        />
        <path d="M45 24 27 14v20" fill="#fff" />
      </svg>
    </span>
  );
}

interface VSLPlayerProps {
  placement?: VideoPlacement;
  gender?: FunnelVideoGender;
  sectionLabel?: string | null;
}

function buildYoutubeEmbedSrc(youtubeId: string, autoplay: boolean) {
  const embedParams = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    cc_load_policy: '0',
  });

  if (autoplay) {
    embedParams.set('autoplay', '1');
    embedParams.set('controls', '0');
    embedParams.set('iv_load_policy', '3');
    embedParams.set('fs', '0');
    embedParams.set('disablekb', '1');
  } else {
    embedParams.set('controls', '1');
  }

  return `https://www.youtube-nocookie.com/embed/${youtubeId}?${embedParams.toString()}`;
}

export function VSLPlayer({
  placement = 'funnel',
  gender = 'neutral',
  sectionLabel,
}: VSLPlayerProps) {
  const config =
    placement === 'postBooking' ? postBookingVideo : funnelVideosByGender[gender];
  const label = sectionLabel ?? config.sectionLabel;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(
    config.provider === 'loom' ||
      config.provider === 'file' ||
      (config.provider === 'youtube' && placement === 'postBooking')
  );

  useEffect(() => {
    if (config.provider !== 'loom') {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://www.loom.com';
    document.head.appendChild(link);
    return () => link.remove();
  }, [config.provider]);

  useEffect(() => {
    if (!playing || config.provider !== 'file') {
      return;
    }
    void videoRef.current?.play();
  }, [playing, config.provider]);

  const youtubeId = config.youtubeId;
  const thumbnail =
    youtubeId && `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  const embedSrc =
    youtubeId && buildYoutubeEmbedSrc(youtubeId, playing && placement === 'funnel');

  return (
    <div className="vsl-section">
      {label && <h2 className="vsl-section-label">{label}</h2>}
      <div className="vsl-player">
        {config.provider === 'loom' && config.loomEmbedUrl && (
          <iframe src={config.loomEmbedUrl} title={config.title} allowFullScreen />
        )}
        {config.provider === 'youtube' && youtubeId && playing && embedSrc && (
          <iframe
            src={embedSrc}
            title={config.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
        {config.provider === 'file' && config.src && !playing && (
          <button
            type="button"
            className="vsl-player-facade"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            {config.poster && (
              <img
                src={config.poster}
                alt=""
                className="vsl-player-thumb"
                loading="eager"
              />
            )}
            <PlayButton />
          </button>
        )}
        {config.provider === 'file' && config.src && playing && (
          <video
            ref={videoRef}
            className="vsl-player-video"
            src={config.src}
            poster={config.poster}
            title={config.title}
            controls
            autoPlay
            playsInline
            preload="auto"
          />
        )}
        {config.provider === 'youtube' && youtubeId && !playing && thumbnail && (
          <button
            type="button"
            className="vsl-player-facade"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            <img
              src={thumbnail}
              alt=""
              className="vsl-player-thumb"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
              }}
            />
            <PlayButton />
          </button>
        )}
      </div>
    </div>
  );
}
