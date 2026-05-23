import { Outlet } from 'react-router-dom';
import { logoSrc } from '../data/assets';
import { Footer } from './Footer';
import './Layout.css';

export function Layout() {
  return (
    <div className="layout">
      <header className="layout-header">
        <img src={logoSrc} alt="Swolekol LLC" className="layout-logo" width={520} height={128} />
      </header>
      <Outlet />
      <Footer />
    </div>
  );
}
