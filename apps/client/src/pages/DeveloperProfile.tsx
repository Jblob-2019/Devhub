import React, { useState } from 'react';
import { Page } from '../types';
import {
  Avatar,
  StarCount,
  ForkCount,
  LanguageDot,
  SaveButton,
  DevTabs,
  ContributionGrid,
  SidebarSection,
} from '../components/DevComponents';
import { useDevHubStore } from '../store/useDevHubStore';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from './Auth';

const PINNED_REPOS = [
  { name: 'linux', desc: 'Linux kernel source tree and development mainline', stars: '166k', forks: '50.4k', lang: 'C' },
  { name: 'git', desc: 'Fast, scalable, distributed revision control system source mirror', stars: '51.2k', forks: '25.6k', lang: 'C' },
  { name: 'subsurface', desc: 'Open source dive logging application for recreational, tech, and freediving', stars: '712', forks: '243', lang: 'C++' },
  { name: 'uemacs', desc: 'Linus\' fork of the classic Micro-Emacs text editor', stars: '186', forks: '63', lang: 'C' },
];

const RECENT_REPOS = [
  { name: 'linux', stars: '166k', lang: 'C', updated: '30m ago', isPrivate: false },
  { name: 'git', stars: '51.2k', lang: 'C', updated: '2h ago', isPrivate: false },
  { name: 'subsurface', stars: '712', lang: 'C++', updated: '1d ago', isPrivate: false },
  { name: 'uemacs', stars: '186', lang: 'C', updated: '3d ago', isPrivate: false },
  { name: 'wsl2-linux-kernel', stars: '8.4k', lang: 'C', updated: '1w ago', isPrivate: false },
  { name: 'test-tlpi', stars: '156', lang: 'C', updated: '2w ago', isPrivate: false },
];

import { useAuth } from '../hooks/useAuth';

export function DeveloperProfilePage({ onNav }: { onNav: (page: Page) => void }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading…</div>;
  }
  if (!user) {
    return <LoginPage onNav={onNav} />;
  }

  const [tab, setTab] = useState('Overview');
  const {
    savedDevs,
    toggleSaveDev,
    followingDevs,
    toggleFollowDev,
    addRecent,
  } = useDevHubStore();

  const isFollowed = followingDevs.includes('torvalds');
  const isSaved = savedDevs.includes('torvalds');

  const handleRepoClick = (repoName: string) => {
    addRecent({ type: 'repo', id: `torvalds/${repoName}`, name: `torvalds/${repoName}` });
    onNav('repo');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-6">
        {/* Left Column: Developer Profile Sidebar */}
        <div className="space-y-4">
          {/* Main Profile Info */}
          <div className="dev-card p-5 flex flex-col items-center text-center gap-3">
            <Avatar name="Linus Torvalds" size={96} rounded={true} className="ring-2 ring-[#30363d] ring-offset-2 ring-offset-[#0b141c]" />
            <div>
              <h1 className="font-bold text-lg text-[#f0f6fc]">Linus Torvalds</h1>
              <div className="text-sm font-mono text-[#8b949e]">@torvalds</div>
            </div>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              Creator of Linux and Git. Working on making computer kernels run reliably and fast.
            </p>
            <div className="flex gap-2 w-full pt-1">
              <button
                onClick={() => toggleFollowDev('torvalds')}
                className={`dev-btn flex-1 text-sm py-2 ${
                  isFollowed ? 'dev-btn-secondary' : 'dev-btn-primary'
                }`}
              >
                {isFollowed ? 'Following' : 'Follow'}
              </button>
              <SaveButton
                saved={isSaved}
                onToggle={() => toggleSaveDev('torvalds')}
              />
            </div>
          </div>

          {/* Quick Numerical Stats */}
          <div className="dev-card p-3.5">
            <div className="grid grid-cols-2 gap-3 text-center">
              {[
                { label: 'Followers', value: '241k' },
                { label: 'Following', value: '0' },
                { label: 'Repositories', value: '12' },
                { label: 'Public Gists', value: '6' },
              ].map(stat => (
                <div key={stat.label} className="p-2 rounded bg-[#0d1117] border border-[#30363d]/40">
                  <div className="font-mono font-bold text-base text-[#f0f6fc]">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio Metadata */}
          <div className="dev-card p-4 space-y-2.5 text-xs text-[#c9d1d9]">
            <div className="flex items-center gap-2.5">
              <span className="text-[#8b949e] w-4 text-center">🏢</span>
              <span>Linux Foundation</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#8b949e] w-4 text-center">📍</span>
              <span>Portland, OR</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#8b949e] w-4 text-center">🔗</span>
              <a href="https://github.com/torvalds" target="_blank" rel="noreferrer" className="text-[#2f81f7] hover:underline font-mono">
                github.com/torvalds
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#8b949e] w-4 text-center">📅</span>
              <span className="text-[#8b949e]">Joined GitHub June 2011</span>
            </div>
          </div>

          {/* Organizations */}
          <SidebarSection title="Organizations">
            <div className="flex gap-2 flex-wrap">
              {['Linux Foundation', 'kernel.org', 'git-core'].map(org => (
                <div
                  key={org}
                  className="px-2 py-1 rounded bg-[#21262d] border border-[#30363d] flex items-center gap-1.5 text-xs text-[#8b949e]"
                  title={org}
                >
                  <Avatar name={org} size={18} rounded={false} />
                  <span className="text-[11px] font-mono">{org}</span>
                </div>
              ))}
            </div>
          </SidebarSection>

          {/* Top Languages */}
          <SidebarSection title="Language Mastery">
            <div className="space-y-2">
              {[
                { name: 'C', pct: 74, color: '#555555' },
                { name: 'C++', pct: 16, color: '#f34b7d' },
                { name: 'Python', pct: 5, color: '#3572A5' },
                { name: 'Shell', pct: 5, color: '#89e051' },
              ].map(lang => (
                <div key={lang.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#f0f6fc] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: lang.color }} />
                      {lang.name}
                    </span>
                    <span className="text-[#8b949e]">{lang.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#0d1117] rounded-full overflow-hidden border border-[#30363d]/30">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>
        </div>

        {/* Right Column: Content & Activity */}
        <div className="space-y-5 min-w-0">
          {/* Navigation Tabs */}
          <DevTabs
            tabs={['Overview', 'Repositories', 'Starred', 'Activity']}
            active={tab}
            onChange={setTab}
            counts={{
              Repositories: 12,
              Starred: 28,
            }}
          />

          {tab === 'Overview' && (
            <div className="space-y-5">
              {/* Pinned Repositories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">Pinned Repositories</h2>
                  <span className="text-xs text-[#8b949e] font-mono">Customize pins</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {PINNED_REPOS.map(repo => (
                    <div
                      key={repo.name}
                      className="dev-card dev-card-interactive p-4 flex flex-col justify-between cursor-pointer"
                      onClick={() => handleRepoClick(repo.name)}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-semibold text-sm text-[#2f81f7] hover:underline font-mono">
                            {repo.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                            Public
                          </span>
                        </div>
                        <p className="text-xs text-[#8b949e] mb-3 line-clamp-2 leading-relaxed">
                          {repo.desc}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <LanguageDot lang={repo.lang} />
                        <StarCount count={repo.stars} />
                        <ForkCount count={repo.forks} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 52-Week Contribution Calendar */}
              <div className="dev-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                      Contribution Activity
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                      4,821 commits in 2024
                    </span>
                  </div>
                  <span className="text-xs text-[#8b949e] font-mono">Year 2024 ▼</span>
                </div>
                <ContributionGrid />
              </div>

              {/* Repositories Quick Stream */}
              <div className="dev-card p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                    Recent Repositories
                  </span>
                  <button
                    onClick={() => setTab('Repositories')}
                    className="text-xs text-[#2f81f7] hover:underline"
                  >
                    View all 12 repositories →
                  </button>
                </div>
                <div className="space-y-2">
                  {RECENT_REPOS.map(repo => (
                    <div
                      key={repo.name}
                      onClick={() => handleRepoClick(repo.name)}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-mono text-[#2f81f7] group-hover:underline">
                          {repo.name}
                        </span>
                        <LanguageDot lang={repo.lang} />
                      </div>
                      <div className="flex items-center gap-3">
                        <StarCount count={repo.stars} />
                        <span className="text-[11px] text-[#6e7681] font-mono">
                          {repo.updated}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'Repositories' && (
            <div className="space-y-3">
              {RECENT_REPOS.map(repo => (
                <div
                  key={repo.name}
                  onClick={() => handleRepoClick(repo.name)}
                  className="dev-card dev-card-interactive p-4 flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#2f81f7] font-mono hover:underline">
                        torvalds/{repo.name}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                        Public
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e]">
                      Mainstream repository mirror under active kernel development.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <LanguageDot lang={repo.lang} />
                    <StarCount count={repo.stars} />
                    <span className="text-[11px] text-[#6e7681] font-mono">Updated {repo.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Starred' && (
            <div className="dev-card p-8 text-center">
              <span className="text-sm text-[#8b949e]">
                Displaying 28 publicly starred repositories by @torvalds.
              </span>
            </div>
          )}

          {tab === 'Activity' && (
            <div className="dev-card p-4 space-y-3">
              <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider mb-2">
                Recent Git Events
              </div>
              {[
                { action: 'Pushed 14 commits to', target: 'torvalds/linux', time: '2 hours ago' },
                { action: 'Created tag v6.12-rc3 on', target: 'torvalds/linux', time: '1 day ago' },
                { action: 'Merged pull request #4821 in', target: 'git/git', time: '3 days ago' },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-[#21262d] last:border-0">
                  <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
                  <span className="text-[#8b949e]">{ev.action}</span>
                  <span className="font-mono text-[#2f81f7] hover:underline cursor-pointer">
                    {ev.target}
                  </span>
                  <span className="text-[#6e7681] font-mono ml-auto">{ev.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
