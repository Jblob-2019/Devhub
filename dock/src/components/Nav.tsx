import React, { useState } from 'react';
import { WireBox, WireSearch } from './WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

interface NavProps {
  current: Page;
  onNav: (page: Page) => void;
  mobile?: boolean;
}

export function Nav({ current, onNav, mobile = false }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const navItems: { label: string; page: Page }[] = [
    { label: 'Discover', page: 'home' },
    { label: 'Explore', page: 'explore' },
    { label: 'Dashboard', page: 'dashboard' },
    { label: 'Saved', page: 'saved' },
  ];

  if (mobile) {
    return (
      <nav className="bg-[#FFFFFF] border-b border-[#E0E0E0] sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-12">
          <button onClick={() => onNav('home')} className="flex items-center gap-2">
            <WireBox width={24} height={24} label="" className="text-[8px]" rounded />
            <span className="text-sm font-bold text-[#1A1A1A] tracking-tight">DevHub</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => onNav('explore')} className="wire-btn wire-btn-ghost p-1.5">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" />
              </svg>
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="wire-btn wire-btn-ghost p-1.5">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                {menuOpen
                  ? <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                  : <><path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" /></>
                }
              </svg>
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[#E0E0E0] bg-white">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => { onNav(item.page); setMenuOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm border-b border-[#F0F0F0] last:border-0 ${
                  current === item.page ? 'font-semibold text-[#1A1A1A] bg-[#F5F5F5]' : 'text-[#4A4A4A]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="px-4 py-3 border-t border-[#E8E8E8] flex gap-2">
              <button onClick={() => { onNav('login'); setMenuOpen(false); }} className="wire-btn wire-btn-secondary flex-1 text-xs py-2">Sign In</button>
              <button onClick={() => { onNav('register'); setMenuOpen(false); }} className="wire-btn wire-btn-primary flex-1 text-xs py-2">Sign Up</button>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="bg-[#FFFFFF] border-b border-[#E0E0E0] sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <button onClick={() => onNav('home')} className="flex items-center gap-2 flex-shrink-0">
          <WireBox width={28} height={28} label="" className="text-[8px]" />
          <span className="font-bold text-[#1A1A1A] text-base tracking-tight">DevHub</span>
        </button>

        {/* Search */}
        <WireSearch
          placeholder="Search repositories, developers..."
          value={searchVal}
          onChange={setSearchVal}
          onSubmit={() => onNav('explore')}
          className="flex-1 max-w-sm"
        />

        {/* Nav items */}
        <div className="flex items-center gap-1 flex-1">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onNav(item.page)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                current === item.page
                  ? 'bg-[#F0F0F0] text-[#1A1A1A]'
                  : 'text-[#4A4A4A] hover:bg-[#F5F5F5] hover:text-[#1A1A1A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onNav('login')} className="wire-btn wire-btn-ghost text-sm">Sign In</button>
          <button onClick={() => onNav('register')} className="wire-btn wire-btn-primary text-sm">Sign Up</button>
          <button onClick={() => onNav('profile')} className="ml-1">
            <WireBox width={32} height={32} rounded label="" />
          </button>
        </div>
      </div>
    </nav>
  );
}
