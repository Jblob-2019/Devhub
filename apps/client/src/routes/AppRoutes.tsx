import { useAuth } from '../hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { ExplorePage } from '../pages/Explore';
import { DeveloperProfilePage } from '../pages/DeveloperProfile';
import { RepositoryDetailsPage } from '../pages/RepositoryDetails';
import { SavedItemsPage } from '../pages/SavedItems';
import { DashboardPage } from '../pages/Dashboard';
import { LoginPage, RegisterPage } from '../pages/Auth';

/**
 * Wrapper that provides the legacy `onNav` prop expected by existing page components.
 * It translates simple page identifiers to React Router navigation calls.
 */
function WithNav({ Component }: { Component: React.ComponentType<any> }) {
  const navigate = useNavigate();
  const onNav = (page: string) => {
    const mapping: Record<string, string> = {
      home: '/',
      explore: '/explore',
      profile: '/profile',
      repo: '/repo',
      saved: '/saved',
      dashboard: '/dashboard',
      login: '/login',
      register: '/register',
    };
    const path = mapping[page] || '/';
    navigate(path);
  };
  return <Component onNav={onNav} />;
}

/**
 * ProtectedRoute ensures that the user is authenticated before rendering the component.
 * If not authenticated, redirects to /login.
 */
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return null; // could return a spinner
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithNav Component={HomePage} />} />
        <Route path="/explore" element={<WithNav Component={ExplorePage} />} />
        <Route path="/profile" element={<WithNav Component={DeveloperProfilePage} />} />
        <Route path="/repo" element={<WithNav Component={RepositoryDetailsPage} />} />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <WithNav Component={SavedItemsPage} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <WithNav Component={DashboardPage} />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<WithNav Component={LoginPage} />} />
        <Route path="/register" element={<WithNav Component={RegisterPage} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
