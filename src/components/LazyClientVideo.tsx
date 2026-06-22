import { useEffect, useRef, useState } from 'react';
import type { ClientStoryVideo } from '../data/assets';

interface LazyClientVideoProps {
  story: ClientStoryVideo;
}

export function LazyClientVideo({ story }: LazyClientVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      <video
        className="client-story-video"
        src={shouldLoad ? story.src : undefined}
        poster={story.poster}
        controls={shouldLoad}
        playsInline
        preload="none"
        aria-label={`${story.name} client story`}
      />
    </div>
  );
}
