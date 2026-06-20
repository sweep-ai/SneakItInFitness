import './ApplyButton.css';

interface ApplyButtonProps {
  variant?: 'primary' | 'inverse';
}

function scrollToApplicationForm() {
  const form = document.getElementById('application-form');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  window.location.href = '/#application-form';
}

export function ApplyButton({ variant = 'primary' }: ApplyButtonProps) {
  return (
    <button
      type="button"
      className={`apply-btn${variant === 'inverse' ? ' apply-btn--inverse' : ''}`}
      onClick={scrollToApplicationForm}
    >
      Start Your Transformation
    </button>
  );
}
