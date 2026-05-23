import { prepChecklist } from '../data/copy';
import './PrepChecklist.css';

export function PrepChecklist() {
  return (
    <section className="prep-checklist section">
      <h2>Before your call</h2>
      <ul>
        {prepChecklist.map((item) => (
          <li key={item}>
            <span className="prep-check" aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
