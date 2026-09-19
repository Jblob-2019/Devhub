import React, { useState, useEffect } from 'react';
import { Nav } from './components/Nav';
import { HomePage } from './pages/Home';
import { ExplorePage } from './pages/Explore';
import { DeveloperProfilePage } from './pages/DeveloperProfile';
import { RepositoryDetailsPage } from './pages/RepositoryDetails';
import { SavedItemsPage } from './pages/SavedItems';
import { DashboardPage } from './pages/Dashboard';
import { LoginPage, RegisterPage } from './pages/Auth';
import { MobileHomePage, MobileBottomNav } from './pages/MobileHome';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

// Frame switcher for wireframe presentation
type FrameMode = 'desktop' | 'mobile';

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
    <div className="min-h-screen" style={{ background: '#F4F4F4' }}>
      {/* Wireframe frame switcher — desktop only annotation bar */}
      {!isMobileBreakpoint && (
        <div className="bg-[#EBEBEB] border-b border-[#D8D8D8] px-6 py-1.5 flex items-center gap-4 text-[11px] font-mono text-[#5A5A5A]">
          <span className="font-semibold text-[#3A3A3A]">DevHub Wireframe</span>
          <span className="text-[#B0B0B0]">|</span>
          <span>Phase 1 + Phase 2 · GitHub Developer & Repository Analytics</span>
          <div className="ml-auto flex items-center gap-2">
            <span>View:</span>
            <button
              onClick={() => setFrameMode('desktop')}
              className={`px-2 py-0.5 rounded text-[11px] ${frameMode === 'desktop' ? 'bg-[#3A3A3A] text-white' : 'hover:bg-[#D8D8D8]'}`}
            >
              Desktop 1440×1024
            </button>
            <button
              onClick={() => setFrameMode('mobile')}
              className={`px-2 py-0.5 rounded text-[11px] ${frameMode === 'mobile' ? 'bg-[#3A3A3A] text-white' : 'hover:bg-[#D8D8D8]'}`}
            >
              Mobile 390×844
            </button>
          </div>
        </div>
      )}

      {showMobile ? (
        /* Mobile frame */
        <div className="flex justify-center py-0 bg-[#F4F4F4]" style={!isMobileBreakpoint ? { paddingTop: '24px', paddingBottom: '24px' } : {}}>
          {!isMobileBreakpoint ? (
            <div className="relative" style={{ width: 390 }}>
              {/* Phone frame */}
              <div className="bg-white border-2 border-[#3A3A3A] rounded-[36px] overflow-hidden shadow-xl" style={{ width: 390, minHeight: 844 }}>
                {/* Status bar */}
                <div className="bg-[#F9F9F9] flex justify-between items-center px-6 py-2 text-[11px] font-mono text-[#3A3A3A]">
                  <span>9:41</span>
                  <span>●●●●</span>
                </div>
                {/* Mobile nav */}
                <Nav current={page} onNav={handleNav} mobile />
                {/* Content */}
                <div className="overflow-y-auto" style={{ minHeight: 700, paddingBottom: 64 }}>
                  <MobileRenderPage page={page} onNav={handleNav} />
                </div>
                {/* Bottom nav */}
                <MobileBottomNav current={page} onNav={handleNav} />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Nav current={page} onNav={handleNav} mobile />
              <div style={{ paddingBottom: 64 }}>
                <MobileRenderPage page={page} onNav={handleNav} />
              </div>
              <MobileBottomNav current={page} onNav={handleNav} />
            </div>
          )}
        </div>
      ) : (
        /* Desktop frame */
        <div>
          <Nav current={page} onNav={handleNav} />
          <DesktopRenderPage page={page} onNav={handleNav} />
        </div>
      )}

      {/* Wireframe legend — bottom annotation */}
      {!isMobileBreakpoint && frameMode === 'desktop' && (
        <div className="border-t border-[#E0E0E0] bg-[#EFEFEF] px-6 py-3">
          <div className="max-w-[1440px] mx-auto flex flex-wrap gap-4 items-center text-[11px] font-mono text-[#5A5A5A]">
            <span className="font-semibold text-[#3A3A3A]">Pages:</span>
            {([
              ['home', 'Home / Discovery'],
              ['explore', 'Explore & Search'],
              ['profile', 'Developer Profile'],
              ['repo', 'Repository Details'],
              ['saved', 'Saved Items'],
              ['dashboard', 'Dashboard'],
              ['login', 'Login'],
              ['register', 'Register'],
            ] as [Page, string][]).map(([p, label]) => (
              <button
                key={p}
                onClick={() => handleNav(p)}
                className={`px-2 py-0.5 rounded hover:bg-[#E0E0E0] transition-colors ${page === p ? 'bg-[#3A3A3A] text-white' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopRenderPage({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  const props = { onNav };
  switch (page) {
    case 'home': return <HomePage {...props} />;
    case 'explore': return <ExplorePage {...props} />;
    case 'profile': return <DeveloperProfilePage {...props} />;
    case 'repo': return <RepositoryDetailsPage {...props} />;
    case 'saved': return <SavedItemsPage {...props} />;
    case 'dashboard': return <DashboardPage {...props} />;
    case 'login': return <LoginPage {...props} />;
    case 'register': return <RegisterPage {...props} />;
    default: return <HomePage {...props} />;
  }
}

function MobileRenderPage({ page, onNav }: { page: Page; onNav: (p: Page) => void }) {
  const props = { onNav };
  switch (page) {
    case 'home': return <MobileHomePage {...props} />;
    case 'explore': return <ExplorePage {...props} />;
    case 'profile': return <DeveloperProfilePage {...props} />;
    case 'repo': return <RepositoryDetailsPage {...props} />;
    case 'saved': return <SavedItemsPage {...props} />;
    case 'dashboard': return <DashboardPage {...props} />;
    case 'login': return <LoginPage {...props} />;
    case 'register': return <RegisterPage {...props} />;
    default: return <MobileHomePage {...props} />;
  }
}
