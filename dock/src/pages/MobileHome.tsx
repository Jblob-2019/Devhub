import React, { useState } from 'react';
import {
  WireBox, WireStarCount, WireForkCount, WireLangDot, WireSaveBtn, WireSearch, WireRateLimitAlert
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

const categories = ['All', 'JS', 'Python', 'Rust', 'Go', 'TypeScript', 'AI/ML'];

export function MobileHomePage({ onNav }: { onNav: (page: Page) => void }) {
  const [cat, setCat] = useState('All');
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <div className="px-4 py-4 page-enter space-y-4">
      {!alertDismissed && (
        <WireRateLimitAlert onDismiss={() => setAlertDismissed(true)} />
      )}

      {/* Hero */}
      <div className="wire-card bg-[#F9F9F9] p-5 text-center space-y-3">
        <h1 className="text-lg font-bold text-[#1A1A1A]">Discover Repositories & Developers</h1>
        <WireSearch placeholder="Search GitHub..." onSubmit={() => onNav('explore')} />
      </div>

      {/* Category chips scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} className={`wire-chip flex-shrink-0 ${cat === c ? 'active' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-[#1A1A1A]">Trending</span>
          <button onClick={() => onNav('explore')} className="text-xs text-[#7A7A7A]">See all</button>
        </div>
        <div className="space-y-2">
          {[
            { name: 'vercel/next.js', stars: '118k', lang: 'JavaScript' },
            { name: 'microsoft/vscode', stars: '156k', lang: 'TypeScript' },
            { name: 'rust-lang/rust', stars: '94.5k', lang: 'Rust' },
          ].map((repo, i) => (
            <div key={i} className="wire-card p-3 flex items-center gap-3">
              <WireBox width={32} height={32} label="" className="flex-shrink-0 text-[8px]" />
              <div className="flex-1 min-w-0">
                <button onClick={() => onNav('repo')} className="font-medium text-sm text-[#1A1A1A] truncate block hover:underline">{repo.name}</button>
                <div className="flex gap-2 mt-0.5">
                  <WireStarCount count={repo.stars} />
                  <WireLangDot lang={repo.lang} />
                </div>
              </div>
              <WireSaveBtn saved={saved[i]} onToggle={() => setSaved(s => ({ ...s, [i]: !s[i] }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Developers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-sm text-[#1A1A1A]">Developers</span>
          <button onClick={() => onNav('explore')} className="text-xs text-[#7A7A7A]">See all</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {[
            { name: 'Linus T.', handle: 'torvalds', followers: '241k' },
            { name: 'Evan You', handle: 'yyx990803', followers: '88k' },
            { name: 'Sindre S.', handle: 'sindresorhus', followers: '47k' },
          ].map((dev, i) => (
            <button key={i} onClick={() => onNav('profile')} className="wire-card p-3 flex-shrink-0 flex flex-col items-center gap-2 w-28 text-center">
              <WireBox width={40} height={40} rounded label="" className="text-[9px]" />
              <div>
                <div className="font-medium text-xs text-[#1A1A1A]">{dev.name}</div>
                <div className="text-[10px] text-[#9A9A9A]">{dev.followers}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav spacer */}
      <div className="h-16" />
    </div>
  );
}

// Mobile bottom tab bar
export function MobileBottomNav({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  const tabs: { page: Page; label: string; icon: string }[] = [
    { page: 'home', label: 'Home', icon: '⌂' },
    { page: 'explore', label: 'Explore', icon: '⊙' },
    { page: 'saved', label: 'Saved', icon: '♡' },
    { page: 'dashboard', label: 'Me', icon: '◉' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E0E0E0] flex z-50">
      {tabs.map(tab => (
        <button
          key={tab.page}
          onClick={() => onNav(tab.page)}
          className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${
            current === tab.page ? 'text-[#1A1A1A]' : 'text-[#9A9A9A]'
          }`}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
