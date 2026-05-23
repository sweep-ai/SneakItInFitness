import { useNavigate } from 'react-router-dom';
import './ApplyButton.css';

export function ApplyButton() {
  const navigate = useNavigate();

  return (
    <button type="button" className="apply-btn" onClick={() => navigate('/booking')}>
      Book a Strategy Call
    </button>
  );
}
