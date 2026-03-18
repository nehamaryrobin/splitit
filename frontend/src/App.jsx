import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';

import LandingPage    from './pages/LandingPage.jsx';
import LoginPage      from './pages/LoginPage.jsx';
import RegisterPage   from './pages/RegisterPage.jsx';
import DashboardPage  from './pages/DashboardPage.jsx';
import TripPage       from './pages/TripPage.jsx';
import GuestPage      from './pages/GuestPage.jsx';
import OAuthCallback  from './pages/OAuthCallback.jsx';
import NotFoundPage   from './pages/NotFoundPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Redirect already-logged-in users away from login/register
function GuestOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/guest"         element={<GuestPage />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />

      {/* Guest-only */}
      <Route path="/login"    element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
      <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardPage /></ProtectedRoute>
      }/>
      <Route path="/trips/:tripId" element={
        <ProtectedRoute><TripPage /></ProtectedRoute>
      }/>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
