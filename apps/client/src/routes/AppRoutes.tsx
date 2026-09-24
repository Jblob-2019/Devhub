import { useAuth } from '../hooks/useAuth';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { ExplorePage } from '../pages/Explore';
import { DeveloperProfilePage } from '../pages/DeveloperProfile';
import { RepositoryDetailsPage } from '../pages/RepositoryDetails';
import { SavedItemsPage } from '../pages/SavedItems';
import { DashboardPage } from '../pages/Dashboard';
import { LoginPage, RegisterPage } from '../pages/Auth';
import { AuthCallbackPage } from '../pages/AuthCallbackPage';

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
      profile: '/developer',
      repo: '/repository',
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
 * While loading, shows a spinner to avoid flash of unauthenticated content.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WithNav Component={HomePage} />} />
        <Route path="/explore" element={<WithNav Component={ExplorePage} />} />
        <Route path="/developer" element={
          <ProtectedRoute>
            <WithNav Component={DeveloperProfilePage} />
          </ProtectedRoute>
        } />
        <Route path="/repository" element={
          <ProtectedRoute>
            <WithNav Component={RepositoryDetailsPage} />
          </ProtectedRoute>
        } />
        <Route path="/saved" element={
          <ProtectedRoute>
            <WithNav Component={SavedItemsPage} />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <WithNav Component={DashboardPage} />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<WithNav Component={LoginPage} />} />
        <Route path="/register" element={<WithNav Component={RegisterPage} />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}