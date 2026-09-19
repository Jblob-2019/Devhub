import React, { useState } from 'react';
import { Page } from '../types';
import {
  Avatar,
  StarCount,
  LanguageDot,
  SaveButton,
  DevSearch,
  RateLimitShield,
} from '../components/DevComponents';
import { useDevHub } from '../hooks/useDevHub';
import { useDevHubStore } from '../store/useDevHubStore';

export function MobileHomePage({ onNav }: { onNav: (page: Page) => void }) {
  const { categories, selectedCategory, setSelectedCategory, repositories, developers } = useDevHub();
  const { savedRepos, toggleSaveRepo, addRecent } = useDevHubStore();
  const [alertDismissed, setAlertDismissed] = useState(false);

  const handleRepoClick = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    onNav('repo');
  };

  const handleDevClick = (username: string) => {
    addRecent({ type: 'dev', id: username, name: username });
    onNav('profile');
  };

  return (
    <div className="px-4 py-4 page-enter space-y-4">
      {!alertDismissed && (
        <RateLimitShield onDismiss={() => setAlertDismissed(true)} />
      )}

      {/* Mobile Hero Search */}
      <div className="dev-card bg-gradient-to-b from-[#161b22] to-[#0d1117] p-4 text-center space-y-2.5">
        <h1 className="text-base font-bold text-[#f0f6fc]">
          Discover GitHub Repositories
        </h1>
        <DevSearch
          placeholder="Search repos &amp; devs..."
          onSubmit={() => onNav('explore')}
          size="sm"
        />
      </div>

      {/* Category Pills Strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`dev-chip text-[11px] py-0.5 px-2.5 flex-shrink-0 ${
              selectedCategory === cat ? 'active' : ''
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trending Repositories */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-xs text-[#f0f6fc] uppercase tracking-wider">
            Trending Today
          </span>
          <button onClick={() => onNav('explore')} className="text-xs text-[#2f81f7]">
            See all →
          </button>
        </div>
        <div className="space-y-2">
          {repositories.slice(0, 4).map(repo => {
            const isSaved = savedRepos.includes(repo.fullName);
            return (
              <div
                key={repo.id}
                className="dev-card p-3 flex items-center gap-3" role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRepoClick(repo.fullName); }}
                onClick={() => handleRepoClick(repo.fullName)}
              >
                <Avatar name={repo.name} size={32} rounded={false} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-xs text-[#f0f6fc] truncate block hover:text-[#2f81f7]">
                    {repo.fullName}
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    <StarCount count={repo.stars} />
                    <LanguageDot lang={repo.language} />
                  </div>
                </div>
                <SaveButton
                  saved={isSaved}
                  onToggle={() => toggleSaveRepo(repo.fullName)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Spotlight Carousel */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-xs text-[#f0f6fc] uppercase tracking-wider">
            Top Developers
          </span>
          <button onClick={() => onNav('explore')} className="text-xs text-[#2f81f7]">
            See all →
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {developers.slice(0, 4).map(dev => (
            <div
              key={dev.id}
              onClick={() => handleDevClick(dev.username)}
              className="dev-card p-3 flex-shrink-0 flex flex-col items-center text-center gap-1.5 w-28 hover:border-[#414754]" role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleDevClick(dev.username); }}
            >
              <Avatar name={dev.name} size={38} rounded={true} />
              <div className="w-full">
                <div className="font-semibold text-xs text-[#f0f6fc] truncate">
                  {dev.name}
                </div>
                <div className="text-[10px] font-mono text-[#8b949e]">
                  {dev.followers} followers
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-16" />
    </div>
  );
}

// Mobile Bottom Navigation Bar
export function MobileBottomNav({
  current,
  onNav,
}: {
  current: Page;
  onNav: (page: Page) => void;
}) {
  const tabs: { page: Page; label: string; icon: JSX.Element }[] = [
    {
      page: 'home',
      label: 'Discover',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6" />
        </svg>
      ),
    },
    {
      page: 'explore',
      label: 'Explore',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      page: 'saved',
      label: 'Saved',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7-3 7 3V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      page: 'dashboard',
      label: 'Me',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zM6 20v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#161b22] border-t border-[#30363d] flex z-50" role="navigation" aria-label="Bottom navigation">
      {tabs.map(tab => {
        const active = current === tab.page;
        return (
          <button
            key={tab.page}
            onClick={() => onNav(tab.page)}
            aria-label={tab.label}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7] ${
              active ? 'text-[#2f81f7]' : 'text-[#8b949e] hover:text-[#f0f6fc]'
            }`}
          >
            <span className="text-base leading-none font-mono" aria-hidden="true">
              {tab.icon}
            </span>
            <span className="text-[10px] font-medium" aria-hidden="true">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
