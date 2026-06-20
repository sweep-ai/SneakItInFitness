import type { Testimonial } from '../data/assets';
import './TestimonialGallery.css';

interface TestimonialGalleryProps {
  testimonials: Testimonial[];
}

export function TestimonialGallery({ testimonials }: TestimonialGalleryProps) {
  return (
    <div className="testimonial-gallery">
      {testimonials.map((item) => (
        <article key={item.name} className="testimonial-gallery-card">
          <div className="testimonial-gallery-image">
            <img src={item.src} alt={`${item.name} transformation`} loading="lazy" />
          </div>
          <div className="testimonial-gallery-caption">
            <p className="testimonial-gallery-name">{item.name}</p>
            <p className="testimonial-gallery-stat">{item.stat}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
