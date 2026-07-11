import { useEffect, useState } from 'react';
import './StickyApplyBar.css';

const SCROLL_THRESHOLD_PX = 480;

function scrollToApplicationForm() {
  const form = document.getElementById('application-form');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.location.href = '/#application-form';
}

export function StickyApplyBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById('application-form');
    let formInView = false;

    const update = () => {
      const scrolledEnough = window.scrollY > SCROLL_THRESHOLD_PX;
      setVisible(scrolledEnough && !formInView);
    };

    const observer =
      form && 'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              formInView = entries[0]?.isIntersecting ?? false;
              update();
            },
            { threshold: 0.2 }
          )
        : null;

    if (observer && form) {
      observer.observe(form);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, []);

  return (
    <div className={`sticky-apply-bar${visible ? ' sticky-apply-bar--visible' : ''}`} aria-hidden={!visible}>
      <button
        type="button"
        className="sticky-apply-bar-btn"
        onClick={scrollToApplicationForm}
        tabIndex={visible ? 0 : -1}
      >
        Apply Now
      </button>
    </div>
  );
}
