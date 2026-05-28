import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MalePage } from './pages/MalePage';
import { FemalePage } from './pages/FemalePage';
import { GenderFunnelPage } from './pages/GenderFunnelPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { FoodPage } from './pages/FoodPage';
import { YoyoPage } from './pages/YoyoPage';
import { MetaPixelRouteTracker } from './components/MetaPixelRouteTracker';

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
          <Route index element={<HomePage />} />
          <Route path="male" element={<MalePage />} />
          <Route path="female" element={<FemalePage />} />
          <Route path="male/:concept" element={<GenderFunnelPage gender="male" />} />
          <Route path="female/:concept" element={<GenderFunnelPage gender="female" />} />
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
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
          <Route path="food" element={<FoodPage />} />
          <Route path="yoyo" element={<YoyoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
