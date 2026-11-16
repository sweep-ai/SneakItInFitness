import { useEffect } from 'react';

const WIDGET_SRC = 'https://portal.simplecheck.ai/assets/external/widget.min.js';
const CLIENT_ID = 'widget_44c72444-6ec8-4835-aaa9-328c370eeebb';

export function SimpleCheckWidget() {
  useEffect(() => {
    // Remove on unmount so the widget re-initializes when the route is revisited.
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = WIDGET_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto 96px', overflow: 'visible' }}>
      <div
        className="simplecheck-inline-widget"
        data-client-id={CLIENT_ID}
        style={{ minWidth: '320px', height: 'auto' }}
      />
    </div>
  );
}
