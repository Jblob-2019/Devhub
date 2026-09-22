import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FrameMode } from './types';
import { Nav } from './components/Nav';
import { AuthGate, ProtectedRoute } from './components';
import { HomePage } from './pages/Home';
import { ExplorePage } from './pages/Explore';
import { DeveloperProfilePage } from './pages/DeveloperProfile';
import { RepositoryDetailsPage } from './pages/RepositoryDetails';
import { SavedItemsPage } from './pages/SavedItems';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage, RegisterPage } from './pages/Auth';
import { MobileHomePage, MobileBottomNav } from './pages/MobileHome';

// Mobile layout wrapper component
function MobileLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isMobileBreakpoint, setIsMobileBreakpoint] = React.useState(false);
  const [frameMode] = React.useState<FrameMode>('desktop');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobileBreakpoint(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileBreakpoint(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showMobile = frameMode === 'mobile' || isMobileBreakpoint;

  // Get current path for Nav
  const location = useLocation();
  const currentPage = location.pathname === '/' ? 'home' :
    location.pathname === '/explore' ? 'explore' :
    location.pathname.startsWith('/developer') ? 'profile' :
    location.pathname.startsWith('/repository') ? 'repo' :
    location.pathname === '/saved' ? 'saved' :
    location.pathname === '/dashboard' ? 'dashboard' :
    location.pathname === '/login' ? 'login' :
    location.pathname === '/register' ? 'register' : 'home';

  const handleNav = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.href = page === 'home' ? '/' : page.startsWith('/') ? page : `/${page}`;
  };

  if (showMobile && !isMobileBreakpoint) {
    return (
      <div className="flex justify-center bg-[#0b141c]" style={{ paddingTop: '28px', paddingBottom: '36px' }}>
        <div className="relative" style={{ width: 390 }}>
          <div className="bg-[#0b141c] border-2 border-[#30363d] rounded-[40px] overflow-hidden shadow-2xl flex flex-col" style={{ width: 390, minHeight: 844 }}>
            <div className="bg-[#161b22] border-b border-[#30363d] flex justify-between items-center px-6 py-2 text-[11px] font-mono text-[#8b949e] select-none">
              <span className="font-semibold text-[#f0f6fc]">9:41</span>
              <div className="w-20 h-4 rounded-full bg-[#0d1117] border border-[#30363d]" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>
            <Nav current={currentPage as any} mobile />
            <div className="overflow-y-auto flex-1 pb-16">
              {children}
            </div>
            <MobileBottomNav current={currentPage as any} onNav={handleNav} />
          </div>
        </div>
      </div>
    );
  }

  if (showMobile && isMobileBreakpoint) {
    return (
      <div className="w-full">
        <Nav current={currentPage as any} mobile />
        <div className="pb-16">
          {children}
        </div>
        <MobileBottomNav current={currentPage as any} onNav={handleNav} />
      </div>
    );
  }

  // Desktop
  return (
    <div className="w-full">
      <Nav current={currentPage as any} />
      {children}
    </div>
  );
}

// Auth callback page for GitHub OAuth redirect
function AuthCallbackPage() {
  const { refresh } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    const initAuth = async () => {
      await refresh();
      // Redirect to intended destination or home
      const from = (location.state as any)?.from?.pathname || '/';
      window.location.href = from;
    };
    initAuth();
  }, [refresh, location]);

  return (
    <div className="min-h-screen bg-[#0b141c] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#8b949e] font-mono">Completing sign in...</p>
      </div>
    </div>
  );
}

// Public routes that don't require auth
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthGate redirectTo="/"><LoginPage /></AuthGate>} />
      <Route path="/register" element={<AuthGate redirectTo="/"><RegisterPage /></AuthGate>} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/developer" element={<DeveloperProfilePage />} />
      <Route path="/repository" element={<RepositoryDetailsPage />} />
    </Routes>
  );
}

// Protected routes that require auth
function PrivateRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
    </Routes>
  );
}

// Root route - the authentication gate
function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b141c] flex items-center justify-center" role="status" aria-label="Loading authentication">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#8b949e] font-mono">Loading DevHub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/home" replace />;
}

// Home route - only accessible when authenticated
function HomeRoute() {
  return (
    <Routes>
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/" element={<RootRoute />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#0b141c] text-[#f0f6fc] flex flex-col font-sans">
          <main className="flex-1">
            <MobileLayout>
              <Routes>
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/login" element={<AuthGate redirectTo="/"><LoginPage /></AuthGate>} />
                <Route path="/register" element={<AuthGate redirectTo="/"><RegisterPage /></AuthGate>} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/developer" element={<DeveloperProfilePage />} />
                <Route path="/repository" element={<RepositoryDetailsPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><SavedItemsPage /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/" element={<RootRoute />} />
              </Routes>
            </MobileLayout>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
