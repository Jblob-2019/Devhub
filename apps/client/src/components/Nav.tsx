import { useAuth } from '../hooks/useAuth';
import { Page } from '../types';
import { Avatar, DevSearch } from './DevComponents';

interface NavProps {
  current: Page;
  onNav: (page: Page) => void;
  mobile?: boolean;
}

export function Nav({ current, onNav, mobile = false }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const { user, loading, logout } = useAuth();
    { label: 'Discover', page: 'home' },
    { label: 'Explore', page: 'explore' },
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Saved', page: 'saved' },
  ];

  if (mobile) {
    return (
      // Mobile navigation bar with proper ARIA and focus styling
      <nav
        className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50"
        role="navigation"
        aria-label="Mobile primary navigation"
      >
        <div className="flex items-center justify-between px-4 h-12">
          <button
            onClick={() => onNav('home')}
            className="flex items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
          >
            <div className="w-6 h-6 rounded-md bg-[#238636] flex items-center justify-center text-white font-bold text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
              D
            </div>
            <span className="text-sm font-bold text-[#f0f6fc] tracking-tight">DevHub</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNav('explore')}
              className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3.5 3.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              aria-label="Menu"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
                {menuOpen ? (
                  <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#30363d] bg-[#161b22] px-3 py-2 space-y-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => {
                  onNav(item.page);
                  setMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7] ${
                  current === item.page
                    ? 'font-semibold text-[#f0f6fc] bg-[#21262d] border-l-2 border-[#2f81f7]'
                    : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 pb-1 border-t border-[#30363d] flex gap-2">
              <button
                onClick={() => {
                  onNav('login');
                  setMenuOpen(false);
                }}
                className="dev-btn dev-btn-secondary flex-1 text-xs py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onNav('register');
                  setMenuOpen(false);
                }}
                className="dev-btn dev-btn-primary flex-1 text-xs py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    // Desktop navigation with ARIA and focus-visible styling
    <nav className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-50" role="navigation" aria-label="Primary navigation">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-6">
        {/* Brand Logo */}
        <button
          onClick={() => onNav('home')}
          className="flex items-center gap-2.5 flex-shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
        >
          <div className="w-7 h-7 rounded-md bg-[#238636] border border-[#2ea043] flex items-center justify-center text-white font-mono font-bold text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            &gt;_
          </div>
          <span className="font-bold text-[#f0f6fc] text-base tracking-tight group-hover:text-[#2f81f7] transition-colors">
            DevHub
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[#30363d] bg-[#0d1117] text-[#8b949e]">v2.0</span>
        </button>

        {/* Global Search */}
        <DevSearch
          placeholder="Search repositories, developers, topics..."
          value={searchVal}
          onChange={setSearchVal}
          onSubmit={() => onNav('explore')}
          className="flex-1 max-w-sm"
        />

        {/* Navigation Items */}
        <div className="flex items-center gap-1 flex-1" role="menubar" aria-label="Main navigation">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onNav(item.page)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7] ${
                current === item.page
                  ? 'bg-[#21262d] text-[#f0f6fc] font-semibold border border-[#30363d]'
                  : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth / Profile Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {user ? (
            <>
              <button
                onClick={logout}
                className="dev-btn dev-btn-ghost text-xs"
              >
                Sign Out
              </button>
              <div className="h-4 w-px bg-[#30363d] mx-1" />
              <button
                onClick={() => onNav('profile')}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
                title="View Profile"
              >
                <Avatar name={user.name || 'User'} size={28} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNav('login')}
                className="dev-btn dev-btn-ghost text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              >
                Sign In
              </button>
              <button
                onClick={() => onNav('register')}
                className="dev-btn dev-btn-primary text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
              >
                Sign Up
              </button>
              <div className="h-4 w-px bg-[#30363d] mx-1" />
              <button
                onClick={() => onNav('profile')}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]"
                title="View Developer Profile (@torvalds)"
              >
                <Avatar name="Linus Torvalds" size={28} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
