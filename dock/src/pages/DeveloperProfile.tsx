import React, { useState } from 'react';
import {
  WireBox, WireChart, WireStarCount, WireForkCount, WireLangDot, WireSaveBtn,
  WireTabs, WireMetricCard, WireLangBar, WireContribGrid, WireSidebarSection
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

const pinnedRepos = [
  { name: 'linux', desc: 'Linux kernel source tree', stars: '166k', forks: '50.4k', lang: 'C' },
  { name: 'git', desc: 'Git Source Code Mirror', stars: '51.2k', forks: '25.6k', lang: 'C' },
  { name: 'subsurface', desc: 'Dive logging software', stars: '712', forks: '243', lang: 'C++' },
  { name: 'uemacs', desc: 'Micro-Emacs editor', stars: '186', forks: '63', lang: 'C' },
];

const recentRepos = [
  { name: 'linux', stars: '166k', lang: 'C', updated: '30m ago' },
  { name: 'git', stars: '51.2k', lang: 'C', updated: '2h ago' },
  { name: 'subsurface', stars: '712', lang: 'C++', updated: '1d ago' },
  { name: 'uemacs', stars: '186', lang: 'C', updated: '3d ago' },
  { name: 'wsl2-linux-kernel', stars: '8.4k', lang: 'C', updated: '1w ago' },
  { name: 'test-tlpi', stars: '156', lang: 'C', updated: '2w ago' },
];

export function DeveloperProfilePage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Repositories');
  const [followed, setFollowed] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Left: profile sidebar */}
        <div className="space-y-4">
          {/* Profile header */}
          <div className="wire-card p-5 flex flex-col items-center text-center gap-3">
            <WireBox width={96} height={96} rounded label="avatar" className="text-[10px]" />
            <div>
              <h1 className="font-bold text-lg text-[#1A1A1A]">Linus Torvalds</h1>
              <div className="text-sm text-[#7A7A7A]">@torvalds</div>
            </div>
            <p className="text-xs text-[#4A4A4A]">Creator of Linux and Git. Working on making computers work reliably.</p>
            <div className="flex gap-2 w-full">
              <button onClick={() => setFollowed(f => !f)} className={`wire-btn flex-1 text-sm py-2 ${followed ? 'wire-btn-primary' : 'wire-btn-secondary'}`}>
                {followed ? 'Following' : 'Follow'}
              </button>
              <WireSaveBtn saved={saved} onToggle={() => setSaved(s => !s)} />
            </div>
          </div>

          {/* Stats */}
          <div className="wire-card p-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Followers', value: '241k' }, { label: 'Following', value: '0' },
                { label: 'Repos', value: '12' }, { label: 'Gists', value: '6' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="font-bold text-[#1A1A1A]">{s.value}</div>
                  <div className="text-[11px] text-[#9A9A9A]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio details */}
          <div className="wire-card p-4 space-y-2">
            {[
              { icon: '🏢', text: 'Linux Foundation' },
              { icon: '📍', text: 'Portland, OR' },
              { icon: '🔗', text: 'github.com/torvalds' },
              { icon: '📅', text: 'Joined Jun 2011' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#4A4A4A]">
                <span className="w-4">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Orgs */}
          <WireSidebarSection title="Organizations">
            <div className="flex gap-2 flex-wrap">
              {[0, 1, 2].map(i => (
                <WireBox key={i} width={28} height={28} label="" className="text-[8px]" />
              ))}
            </div>
          </WireSidebarSection>

          {/* Languages */}
          <WireSidebarSection title="Top Languages">
            <div className="space-y-2">
              {[{ name: 'C', pct: 74 }, { name: 'C++', pct: 16 }, { name: 'Python', pct: 5 }, { name: 'Shell', pct: 5 }].map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-[#4A4A4A] w-16">{l.name}</span>
                  <div className="flex-1 h-1.5 bg-[#EBEBEB] rounded-full">
                    <div className="h-full bg-[#5A5A5A] rounded-full" style={{ width: `${l.pct}%` }} />
                  </div>
                  <span className="text-[11px] text-[#9A9A9A] font-mono w-7 text-right">{l.pct}%</span>
                </div>
              ))}
            </div>
          </WireSidebarSection>
        </div>

        {/* Right: main content */}
        <div className="space-y-5">
          {/* Metrics row */}
          <div className="grid grid-cols-4 gap-3">
            <WireMetricCard label="Total Stars" value="166.8k" sublabel="↑ 2.3k this month" trend="up" />
            <WireMetricCard label="Contributions" value="4,821" sublabel="past year" />
            <WireMetricCard label="Pull Requests" value="1,243" sublabel="merged" />
            <WireMetricCard label="Issues" value="8,421" sublabel="opened total" />
          </div>

          {/* Tabs */}
          <WireTabs
            tabs={['Repositories', 'Activity', 'Analytics']}
            active={tab}
            onChange={setTab}
          />

          {tab === 'Repositories' && (
            <div>
              {/* Pinned */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">Pinned</span>
                  <span className="annotation">6 pinned</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {pinnedRepos.map((repo, i) => (
                    <div key={i} className="wire-card p-3">
                      <div className="flex items-start justify-between mb-1">
                        <button onClick={() => onNav('repo')} className="font-medium text-sm text-[#1A1A1A] hover:underline">{repo.name}</button>
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#9A9A9A" strokeWidth="1.5">
                          <path d="M8 2v12M2 8h12" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-xs text-[#7A7A7A] mb-2">{repo.desc}</p>
                      <div className="flex gap-3">
                        <WireStarCount count={repo.stars} />
                        <WireForkCount count={repo.forks} />
                        <WireLangDot lang={repo.lang} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* All repos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">All Repositories</span>
                  <span className="text-xs text-[#7A7A7A]">12 total</span>
                </div>
                <div className="space-y-2">
                  {recentRepos.map((repo, i) => (
                    <div key={i} className="wire-card p-3 flex items-center gap-3">
                      <WireBox width={28} height={28} label="" className="flex-shrink-0 text-[8px]" />
                      <button onClick={() => onNav('repo')} className="font-medium text-sm text-[#1A1A1A] hover:underline flex-1">{repo.name}</button>
                      <WireStarCount count={repo.stars} />
                      <WireLangDot lang={repo.lang} />
                      <span className="text-[11px] text-[#9A9A9A] font-mono w-14 text-right">{repo.updated}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'Activity' && (
            <div className="space-y-4">
              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Contribution Graph</div>
                <div className="overflow-x-auto pb-1">
                  <WireContribGrid />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] text-[#9A9A9A] font-mono">
                  <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
                </div>
                <div className="mt-2 text-xs text-[#7A7A7A]">4,821 contributions in the last year</div>
              </div>

              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Recent Activity</div>
                <div className="space-y-3">
                  {[
                    { event: 'Pushed 3 commits to', target: 'linux', time: '30m ago' },
                    { event: 'Commented on issue in', target: 'git', time: '2h ago' },
                    { event: 'Reviewed pull request in', target: 'linux', time: '4h ago' },
                    { event: 'Created release v6.7 in', target: 'linux', time: '1d ago' },
                    { event: 'Merged pull request in', target: 'subsurface', time: '2d ago' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="wire-box w-6 h-6 rounded-full flex-shrink-0 text-[9px]">●</div>
                      <div className="flex-1">
                        <span className="text-xs text-[#4A4A4A]">{act.event} </span>
                        <button onClick={() => onNav('repo')} className="text-xs font-medium text-[#1A1A1A] hover:underline">{act.target}</button>
                      </div>
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'Analytics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="wire-card p-4">
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Commit Activity</div>
                  <WireChart height={120} type="bar" label="commits/week" />
                </div>
                <div className="wire-card p-4">
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Language Distribution</div>
                  <WireChart height={120} type="pie" label="lang split" />
                </div>
              </div>
              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Stars Over Time</div>
                <WireChart height={140} type="area" label="cumulative stars" className="w-full" />
              </div>
              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Language Bar</div>
                <WireLangBar langs={[
                  { name: 'C', pct: 74 }, { name: 'C++', pct: 16 }, { name: 'Python', pct: 5 }, { name: 'Shell', pct: 5 }
                ]} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
