import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MetaPixelRouteTracker } from './components/MetaPixelRouteTracker';

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MalePage = lazy(() => import('./pages/MalePage').then((m) => ({ default: m.MalePage })));
const FemalePage = lazy(() => import('./pages/FemalePage').then((m) => ({ default: m.FemalePage })));
const GenderFunnelPage = lazy(() =>
  import('./pages/GenderFunnelPage').then((m) => ({ default: m.GenderFunnelPage }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const DisclaimerPage = lazy(() =>
  import('./pages/DisclaimerPage').then((m) => ({ default: m.DisclaimerPage }))
);
const FoodPage = lazy(() => import('./pages/FoodPage').then((m) => ({ default: m.FoodPage })));
const YoyoPage = lazy(() => import('./pages/YoyoPage').then((m) => ({ default: m.YoyoPage })));

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

export default function App() {
  return (
    <BrowserRouter>
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
            path="male/:concept"
            element={
              <Suspense fallback={<PageLoader />}>
                <GenderFunnelPage gender="male" />
              </Suspense>
            }
          />
          <Route
            path="female/:concept"
            element={
              <Suspense fallback={<PageLoader />}>
                <GenderFunnelPage gender="female" />
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
          <Route
            path="food"
            element={
              <Suspense fallback={<PageLoader />}>
                <FoodPage />
              </Suspense>
            }
          />
          <Route
            path="yoyo"
            element={
              <Suspense fallback={<PageLoader />}>
                <YoyoPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
