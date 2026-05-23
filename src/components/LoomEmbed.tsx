import { useEffect } from 'react';
import './LoomEmbed.css';

const LOOM_EMBED_URL =
  'https://www.loom.com/embed/6d9ef587dac6459fadbc8739f82ebad4';

export function LoomEmbed() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://www.loom.com';
    document.head.appendChild(link);
    return () => link.remove();
  }, []);

  return (
    <div className="loom-embed">
      <iframe
        src={LOOM_EMBED_URL}
        title="Pre-call preparation video"
        allowFullScreen
      />
    </div>
  );
}
