import { useEffect, useState } from 'react';
import './StickyApplyBar.css';

export function scrollToApplicationForm() {
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

    const update = () => {
      const scrolledPastForm = form ? form.getBoundingClientRect().bottom < 0 : false;
      setVisible(scrolledPastForm);
    };

    window.addEventListener('scroll', update, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', update);
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
