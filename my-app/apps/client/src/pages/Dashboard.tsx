import React, { useState } from 'react';
import { Page } from '../types';
import {
  Avatar,
  VectorChart,
  DevTabs,
  MetricCard,
  ContributionGrid,
  SidebarSection,
  RateLimitShield,
  StarCount,
  LanguageDot,
} from '../components/DevComponents';
import { useDevHubStore } from '../store/useDevHubStore';

export function DashboardPage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Overview');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const { savedRepos, savedDevs } = useDevHubStore();

  const myRepos = [
    { name: 'linux', stars: '166k', lang: 'C', updated: '30m ago', isPrivate: false },
    { name: 'git', stars: '51.2k', lang: 'C', updated: '2h ago', isPrivate: false },
    { name: 'subsurface', stars: '712', lang: 'C++', updated: '1d ago', isPrivate: false },
    { name: 'kernel-private-review', stars: '0', lang: 'C', updated: '4h ago', isPrivate: true },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3.5">
          <Avatar name="Linus Torvalds" size={44} rounded={true} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
                Developer Workspace
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                Connected
              </span>
            </div>
            <p className="text-xs text-[#8b949e] font-mono mt-0.5">
              Welcome back, <span className="text-[#f0f6fc]">@torvalds</span> · Synchronized with GitHub 4m ago
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNav('profile')}
            className="dev-btn dev-btn-secondary text-xs"
          >
            Public Profile
          </button>
          <button className="dev-btn dev-btn-primary text-xs gap-1.5">
            <span>+</span>
            <span>New Repository</span>
          </button>
        </div>
      </div>

      {!alertDismissed && (
        <div className="mb-5">
          <RateLimitShield onDismiss={() => setAlertDismissed(true)} />
        </div>
      )}

      {/* Tabs */}
      <DevTabs
        tabs={['Overview', 'Activity', 'Analytics', 'Recommendations']}
        active={tab}
        onChange={setTab}
        className="mb-6"
      />

      {tab === 'Overview' && (
        <div className="space-y-6">
          {/* Top 4 Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricCard
              label="Total Stars Received"
              value="217.9k"
              sublabel="↑ 2.3k this month"
              trend="up"
            />
            <MetricCard
              label="Annual Contributions"
              value="4,821"
              sublabel="past 365 days"
              trend="up"
            />
            <MetricCard
              label="Followers"
              value="241k"
              sublabel="↑ 1.2k new"
              trend="up"
            />
            <MetricCard
              label="Saved Bookmarks"
              value={savedRepos.length + savedDevs.length}
              sublabel={`${savedRepos.length} repos, ${savedDevs.length} devs`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-5">
              {/* Contribution Activity Graph */}
              <div className="dev-card p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                    Annual Contribution Heatmap
                  </span>
                  <span className="text-xs font-mono text-[#3fb950]">
                    4,821 contributions in 2024
                  </span>
                </div>
                <ContributionGrid />
              </div>

              {/* Repositories Managed */}
              <div className="dev-card p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                    My Active Repositories
                  </span>
                  <span className="text-xs text-[#2f81f7] hover:underline cursor-pointer">
                    Manage all 12 →
                  </span>
                </div>

                <div className="space-y-2">
                  {myRepos.map(repo => (
                    <div
                      key={repo.name}
                      onClick={() => onNav('repo')}
                      className="flex items-center justify-between p-2.5 rounded-md hover:bg-[#21262d] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-sm font-mono text-[#f0f6fc] group-hover:text-[#2f81f7]">
                          {repo.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border ${
                            repo.isPrivate
                              ? 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40'
                              : 'bg-[#21262d] text-[#8b949e] border-[#30363d]'
                          }`}
                        >
                          {repo.isPrivate ? 'Private' : 'Public'}
                        </span>
                        <LanguageDot lang={repo.lang} />
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <StarCount count={repo.stars} />
                        <span className="text-[#6e7681]">Updated {repo.updated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Recommended & Actions */}
            <div className="space-y-5">
              <SidebarSection title="Personalized Feed">
                <p className="text-xs text-[#8b949e] mb-3 leading-relaxed">
                  Based on your interest in C, Linux kernels, and low-level systems:
                </p>
                <div className="space-y-2.5">
                  {[
                    { name: 'rust-lang/rust', desc: 'Zero-cost abstractions systems compiler', stars: '94.5k', lang: 'Rust' },
                    { name: 'ziglang/zig', desc: 'General-purpose programming language', stars: '34.1k', lang: 'Zig' },
                  ].map(rec => (
                    <div
                      key={rec.name}
                      onClick={() => onNav('repo')}
                      className="p-2.5 rounded-md bg-[#0d1117] border border-[#30363d]/50 hover:border-[#2f81f7] cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-mono font-semibold text-[#2f81f7]">
                        {rec.name}
                      </div>
                      <div className="text-[11px] text-[#8b949e] line-clamp-1 mt-0.5">
                        {rec.desc}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs">
                        <LanguageDot lang={rec.lang} />
                        <StarCount count={rec.stars} />
                      </div>
                    </div>
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection title="API Shield & Token">
                <div className="space-y-2 text-xs text-[#8b949e]">
                  <div className="flex justify-between">
                    <span>OAuth Session:</span>
                    <span className="text-[#3fb950] font-mono">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate Limit Shield:</span>
                    <span className="text-[#f0f6fc] font-mono">4,932 / 5,000</span>
                  </div>
                  <div className="pt-2 border-t border-[#30363d]/40">
                    <button className="dev-btn dev-btn-secondary w-full text-xs py-1.5">
                      Regenerate Personal Token
                    </button>
                  </div>
                </div>
              </SidebarSection>
            </div>
          </div>
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Weekly Repository Views
            </span>
            <VectorChart height={160} type="area" label="views / day" />
          </div>
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Stargazers Growth
            </span>
            <VectorChart height={160} type="bar" label="new stars / week" />
          </div>
        </div>
      )}

      {['Activity', 'Recommendations'].includes(tab) && (
        <div className="dev-card p-10 text-center">
          <div className="text-sm font-semibold text-[#f0f6fc] mb-1">{tab} Stream</div>
          <div className="text-xs text-[#8b949e]">
            Live data synchronized with your personal developer feed.
          </div>
        </div>
      )}
    </div>
  );
}
