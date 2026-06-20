import { prepChecklist } from '../data/copy';
import './PrepChecklist.css';

interface PrepChecklistProps {
  hideTitle?: boolean;
}

export function PrepChecklist({ hideTitle = false }: PrepChecklistProps) {
  return (
    <section className="prep-checklist section">
      {!hideTitle && <h2>Before your call</h2>}
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
