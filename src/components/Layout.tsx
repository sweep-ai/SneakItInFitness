import { Outlet } from 'react-router-dom';
import { logoSrc } from '../data/assets';
import { Footer } from './Footer';
import './Layout.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <img src={logoSrc} alt="Swolekol LLC" className="layout-logo" width={200} height={44} />
        <p className="layout-slots">
          <span className="layout-slots-dot" aria-hidden="true" />
          Limited slots available
        </p>
      </header>
      <Outlet />
      <Footer />
    </div>
  );
}
