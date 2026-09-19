import React, { useState, useMemo } from 'react';
import { Page } from '../types';
import {
  Avatar,
  StarCount,
  ForkCount,
  LanguageDot,
  SaveButton,
  DevTabs,
  DevSearch,
  EmptyState,
  SidebarSection,
} from '../components/DevComponents';
import { TRENDING_REPOSITORIES, TOP_DEVELOPERS } from '../services/githubService';
import { useDevHubStore } from '../store/useDevHubStore';

import { useAuth } from '../hooks/useAuth';

export function SavedItemsPage({ onNav }: { onNav: (page: Page) => void }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading…</div>;
  }
  if (!user) {
    return <LoginPage onNav={onNav} />;
  }

  const [tab, setTab] = useState('Repositories');
  const [query, setQuery] = useState('');

  const {
    savedRepos,
    toggleSaveRepo,
    savedDevs,
    toggleSaveDev,
    followingDevs,
    toggleFollowDev,
    recentlyViewed,
    addRecent,
  } = useDevHubStore();

  const savedRepoList = useMemo(() => {
    return TRENDING_REPOSITORIES.filter(r => savedRepos.includes(r.fullName))
      .filter(r => !query || r.fullName.toLowerCase().includes(query.toLowerCase()) || r.description.toLowerCase().includes(query.toLowerCase()));
  }, [savedRepos, query]);

  const savedDevList = useMemo(() => {
    return TOP_DEVELOPERS.filter(d => savedDevs.includes(d.username))
      .filter(d => !query || d.name.toLowerCase().includes(query.toLowerCase()) || d.username.toLowerCase().includes(query.toLowerCase()));
  }, [savedDevs, query]);

  const handleRepoClick = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    onNav('repo');
  };

  const handleDevClick = (username: string) => {
    addRecent({ type: 'dev', id: username, name: username });
    onNav('profile');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
            Saved Bookmarks &amp; Collections
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your curated repositories, tracked developers, and project collections
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded border border-[#30363d] bg-[#161b22] text-[#2f81f7]">
          {savedRepos.length + savedDevs.length} Saved
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content Pane */}
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
            <DevSearch
              placeholder="Filter saved items..."
              value={query}
              onChange={setQuery}
              className="flex-1 max-w-sm"
            />
            <DevTabs
              tabs={['Repositories', 'Developers', 'Collections']}
              active={tab}
              onChange={setTab}
              counts={{
                Repositories: savedRepoList.length,
                Developers: savedDevList.length,
                Collections: 3,
              }}
            />
          </div>

          {/* Repositories Tab */}
          {tab === 'Repositories' && (
            <div className="space-y-3">
              {savedRepoList.length === 0 ? (
                <EmptyState
                  title="No saved repositories found"
                  subtitle={query ? 'Try a different search filter' : 'Explore repositories and click the bookmark button to save them.'}
                  action="Explore Repositories"
                  onAction={() => onNav('explore')}
                />
              ) : (
                savedRepoList.map(repo => (
                  <div
                    key={repo.id}
                    className="dev-card dev-card-interactive p-4 flex items-start gap-3.5 cursor-pointer"
                    onClick={() => handleRepoClick(repo.fullName)}
                  >
                    <Avatar name={repo.name} size={36} rounded={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] font-mono">
                            {repo.fullName}
                          </span>
                          <p className="text-xs text-[#8b949e] mt-1 mb-2">
                            {repo.description}
                          </p>
                        </div>
                        <SaveButton
                          saved={true}
                          onToggle={() => toggleSaveRepo(repo.fullName)}
                        />
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <StarCount count={repo.stars} />
                        <ForkCount count={repo.forks} />
                        <LanguageDot lang={repo.language} />
                        <span className="text-[11px] text-[#6e7681] font-mono ml-auto">
                          Saved to favorites
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Developers Tab */}
          {tab === 'Developers' && (
            <div className="space-y-3">
              {savedDevList.length === 0 ? (
                <EmptyState
                  title="No saved developers found"
                  subtitle="Discover top open source engineers and save them to your watchlist."
                  action="Discover Developers"
                  onAction={() => onNav('explore')}
                />
              ) : (
                savedDevList.map(dev => {
                  const isFollowing = followingDevs.includes(dev.username);
                  return (
                    <div
                      key={dev.id}
                      className="dev-card dev-card-interactive p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => handleDevClick(dev.username)}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar name={dev.name} size={42} rounded={true} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#f0f6fc]">
                              {dev.name}
                            </span>
                            <span className="text-xs font-mono text-[#8b949e]">
                              @{dev.username}
                            </span>
                          </div>
                          <p className="text-xs text-[#8b949e] mt-0.5 line-clamp-1">
                            {dev.bio}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] font-mono text-[#6e7681] mt-1">
                            <span>{dev.followers} followers</span>
                            <span>{dev.reposCount} repos</span>
                            <LanguageDot lang={dev.primaryLanguage} />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFollowDev(dev.username);
                          }}
                          className={`dev-btn text-xs py-1 px-3 ${
                            isFollowing ? 'dev-btn-secondary' : 'dev-btn-primary'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <SaveButton
                          saved={true}
                          onToggle={() => toggleSaveDev(dev.username)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Collections Tab */}
          {tab === 'Collections' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Core Frameworks', desc: 'React, Next.js, Vite & Vue tools', count: 4, icon: '⚡' },
                { name: 'Systems & Low-Level', desc: 'Linux kernel, Rust & Deno runtimes', count: 3, icon: '🦀' },
                { name: 'AI & Machine Learning', desc: 'Whisper transformer models and LLM tooling', count: 2, icon: '🧠' },
              ].map(col => (
                <div
                  key={col.name}
                  className="dev-card dev-card-interactive p-4 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl">{col.icon}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                        {col.count} items
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-[#f0f6fc] mb-1">{col.name}</h3>
                    <p className="text-xs text-[#8b949e]">{col.desc}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-[#30363d]/50 flex justify-between text-xs text-[#2f81f7]">
                    <span>View collection →</span>
                    <span className="text-[#6e7681] font-mono">Updated today</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Quick Collections and Recently Viewed */}
        <div className="space-y-5">
          <SidebarSection title="Recently Viewed">
            <div className="space-y-2">
              {recentlyViewed.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNav(item.type === 'repo' ? 'repo' : 'profile')}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={item.name} size={22} rounded={item.type === 'dev'} />
                    <span className="text-xs font-mono text-[#c9d1d9] group-hover:text-[#2f81f7] truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6e7681] flex-shrink-0">
                    {item.time}
                  </span>
                </button>
              ))}
            </div>
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}
