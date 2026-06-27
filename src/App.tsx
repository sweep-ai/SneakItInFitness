import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MetaPixelRouteTracker } from './components/MetaPixelRouteTracker';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MalePage = lazy(() => import('./pages/MalePage').then((m) => ({ default: m.MalePage })));
const FemalePage = lazy(() => import('./pages/FemalePage').then((m) => ({ default: m.FemalePage })));
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() =>
  import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage }))
);

const BookingPage = lazy(() =>
  import('./pages/BookingPage').then((m) => ({ default: m.BookingPage }))
);
const PostBookingPage = lazy(() =>
  import('./pages/PostBookingPage').then((m) => ({ default: m.PostBookingPage }))
);

function PageLoader() {
  return (
    <main className="page-main">
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <p className="subhead">Loading...</p>
      </div>
    </main>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash === '#application-form') {
      requestAnimationFrame(() => {
        document.getElementById('application-form')?.scrollIntoView({ block: 'start' });
      });
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <MetaPixelRouteTracker />
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="male"
            element={
              <Suspense fallback={<PageLoader />}>
                <MalePage />
              </Suspense>
            }
          />
          <Route
            path="female"
            element={
              <Suspense fallback={<PageLoader />}>
                <FemalePage />
              </Suspense>
            }
          />
          <Route
            path="booking"
            element={
              <Suspense fallback={<PageLoader />}>
                <BookingPage />
              </Suspense>
            }
          />
          <Route
            path="post-booking"
            element={
              <Suspense fallback={<PageLoader />}>
                <PostBookingPage />
              </Suspense>
            }
          />
          <Route
            path="privacy"
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicyPage />
              </Suspense>
            }
          />
          <Route
            path="terms"
            element={
              <Suspense fallback={<PageLoader />}>
                <TermsPage />
              </Suspense>
            }
          />
          <Route
            path="disclaimer"
            element={
              <Suspense fallback={<PageLoader />}>
                <DisclaimerPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
