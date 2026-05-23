import type { Testimonial } from '../data/assets';
import './ScrollingBanner.css';

interface ScrollingBannerProps {
  testimonials: Testimonial[];
  direction?: 'left' | 'right';
}

export function ScrollingBanner({
  testimonials,
  direction = 'left',
}: ScrollingBannerProps) {
  const track = [...testimonials, ...testimonials];

  return (
    <div className="scrolling-banner" data-direction={direction}>
      <div className="scrolling-banner-track">
        {track.map((item, i) => (
          <article key={`${item.name}-${i}`} className="scrolling-banner-card">
            <div className="scrolling-banner-image">
              <img src={item.src} alt={`${item.name} transformation`} loading="lazy" />
            </div>
            <div className="scrolling-banner-caption">
              <p className="scrolling-banner-name">{item.name}</p>
              <p className="scrolling-banner-stat">{item.stat}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
