import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Page, FrameMode } from './types';
import { Nav } from './components/Nav';
import { HomePage } from './pages/Home';
import { ExplorePage } from './pages/Explore';
import { DeveloperProfilePage } from './pages/DeveloperProfile';
import { RepositoryDetailsPage } from './pages/RepositoryDetails';
import { SavedItemsPage } from './pages/SavedItems';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage, RegisterPage } from './pages/Auth';
import { MobileHomePage, MobileBottomNav } from './pages/MobileHome';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [frameMode, setFrameMode] = useState<FrameMode>('desktop');
  const [isMobileBreakpoint, setIsMobileBreakpoint] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobileBreakpoint(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobileBreakpoint(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const showMobile = frameMode === 'mobile' || isMobileBreakpoint;

  const handleNav = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
          <AuthProvider>
      <div className="min-h-screen bg-[#0b141c] text-[#f0f6fc] flex flex-col font-sans">
      {/* Viewport Content */}
      <main className="flex-1">
        {showMobile ? (
          /* Mobile Device Frame Container */
          <div
            className="flex justify-center bg-[#0b141c]"
            style={!isMobileBreakpoint ? { paddingTop: '28px', paddingBottom: '36px' } : {}}
          >
            {!isMobileBreakpoint ? (
              <div className="relative" style={{ width: 390 }}>
                {/* Simulated Smartphone Bezel */}
                <div
                  className="bg-[#0b141c] border-2 border-[#30363d] rounded-[40px] overflow-hidden shadow-2xl flex flex-col"
                  style={{ width: 390, minHeight: 844 }}
                >
                  {/* Smartphone Status Bar */}
                  <div className="bg-[#161b22] border-b border-[#30363d] flex justify-between items-center px-6 py-2 text-[11px] font-mono text-[#8b949e] select-none">
                    <span className="font-semibold text-[#f0f6fc]">9:41</span>
                    <div className="w-20 h-4 rounded-full bg-[#0d1117] border border-[#30363d]" />
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <Nav current={page} onNav={handleNav} mobile />

                  {/* Mobile Scrollable View */}
                  <div className="overflow-y-auto flex-1 pb-16">
                    <MobileRenderPage page={page} onNav={handleNav} />
                  </div>

                  {/* Mobile Bottom Navigation */}
                  <MobileBottomNav current={page} onNav={handleNav} />
                </div>
              </div>
            ) : (
              /* Native Mobile Viewport */
              <div className="w-full">
                <Nav current={page} onNav={handleNav} mobile />
                <div className="pb-16">
                  <MobileRenderPage page={page} onNav={handleNav} />
                </div>
                <MobileBottomNav current={page} onNav={handleNav} />
              </div>
            )}
          </div>
        ) : (
          /* Full Desktop Viewport */
          <div className="w-full">
            <Nav current={page} onNav={handleNav} />
            <DesktopRenderPage page={page} onNav={handleNav} />
          </div>
        )}
      </main>
    </div>
    </AuthProvider>
  );
}

function DesktopRenderPage({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  switch (page) {
    case 'home':
      return <HomePage onNav={onNav} />;
    case 'explore':
      return <ExplorePage onNav={onNav} />;
    case 'profile':
      return <DeveloperProfilePage onNav={onNav} />;
    case 'repo':
      return <RepositoryDetailsPage onNav={onNav} />;
    case 'saved':
      return <SavedItemsPage onNav={onNav} />;
    case 'dashboard':
      return <DashboardPage onNav={onNav} />;
    case 'login':
      return <LoginPage onNav={onNav} />;
    case 'register':
      return <RegisterPage onNav={onNav} />;
    default:
      return <HomePage onNav={onNav} />;
  }
}

function MobileRenderPage({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  switch (page) {
    case 'home':
      return <MobileHomePage onNav={onNav} />;
    case 'explore':
      return <ExplorePage onNav={onNav} />;
    case 'profile':
      return <DeveloperProfilePage onNav={onNav} />;
    case 'repo':
      return <RepositoryDetailsPage onNav={onNav} />;
    case 'saved':
      return <SavedItemsPage onNav={onNav} />;
    case 'dashboard':
      return <DashboardPage onNav={onNav} />;
    case 'login':
      return <LoginPage onNav={onNav} />;
    case 'register':
      return <RegisterPage onNav={onNav} />;
    default:
      return <MobileHomePage onNav={onNav} />;
  }
}
