import { useState } from 'react';
import './VSLPlayer.css';

const YOUTUBE_ID = 'Q7arXH-jGyU';
const THUMBNAIL = `https://img.youtube.com/vi/${YOUTUBE_ID}/maxresdefault.jpg`;

const embedParams = new URLSearchParams({
  autoplay: '1',
  rel: '0',
  modestbranding: '1',
  controls: '0',
  iv_load_policy: '3',
  fs: '0',
  disablekb: '1',
  playsinline: '1',
  cc_load_policy: '0',
});

const EMBED_SRC = `https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?${embedParams.toString()}`;

export function VSLPlayer() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="vsl-section">
      <h2 className="vsl-section-label">Learn The System</h2>
      <div className="vsl-player">
        {playing ? (
          <iframe
            src={EMBED_SRC}
            title="Sneak-it-in System video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <button
            type="button"
            className="vsl-player-facade"
            onClick={() => setPlaying(true)}
            aria-label="Play video"
          >
            <img
              src={THUMBNAIL}
              alt=""
              className="vsl-player-thumb"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = `https://img.youtube.com/vi/${YOUTUBE_ID}/hqdefault.jpg`;
              }}
            />
            <span className="vsl-player-play" aria-hidden="true">
              <svg viewBox="0 0 68 48" width="68" height="48">
                <path
                  d="M66.52 7.74a8 8 0 0 0-5.64-5.66C55.3 1 34 1 34 1s-21.3 0-26.88 1.08a8 8 0 0 0-5.64 5.66A83.27 83.27 0 0 0 1 24a83.27 83.27 0 0 0 1.48 16.26 8 8 0 0 0 5.64 5.66C12.7 47 34 47 34 47s21.3 0 26.88-1.08a8 8 0 0 0 5.64-5.66A83.27 83.27 0 0 0 67 24a83.27 83.27 0 0 0-1.48-16.26z"
                  fill="#D70000"
                />
                <path d="M45 24 27 14v20" fill="#fff" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
