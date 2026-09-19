import React, { useState } from 'react';
import {
  WireBox, WireChart, WireStarCount, WireForkCount, WireLangDot,
  WireTabs, WireMetricCard, WireContribGrid, WireSidebarSection, WireRateLimitAlert
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

export function DashboardPage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Overview');
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <WireBox width={40} height={40} rounded label="" className="text-[9px]" />
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">My Dashboard</h1>
            <p className="text-xs text-[#7A7A7A]">Welcome back, torvalds · Last active 10 minutes ago</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNav('profile')} className="wire-btn wire-btn-secondary text-sm">View Profile</button>
          <button className="wire-btn wire-btn-primary text-sm">+ New Repository</button>
        </div>
      </div>

      {!alertDismissed && (
        <div className="mb-4">
          <WireRateLimitAlert onDismiss={() => setAlertDismissed(true)} />
        </div>
      )}

      {/* Tabs */}
      <WireTabs
        tabs={['Overview', 'Activity', 'Analytics', 'Recommendations']}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      {tab === 'Overview' && (
        <div className="space-y-5">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3">
            <WireMetricCard label="Total Stars" value="166.8k" sublabel="↑ 2.3k this month" trend="up" />
            <WireMetricCard label="Contributions" value="4,821" sublabel="past year" />
            <WireMetricCard label="Followers" value="241k" sublabel="↑ 1.2k this month" trend="up" />
            <WireMetricCard label="Saved Items" value="28" sublabel="12 repos, 8 devs, 8 collections" />
          </div>

          <div className="grid grid-cols-[1fr_280px] gap-5">
            <div className="space-y-4">
              {/* Contribution graph */}
              <div className="wire-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">Contribution Activity</span>
                  <span className="annotation">4,821 contributions in 2024</span>
                </div>
                <div className="overflow-x-auto pb-1">
                  <WireContribGrid />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-[#9A9A9A] font-mono">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>

              {/* Recent repos */}
              <div className="wire-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">My Repositories</span>
                  <button className="text-xs text-[#7A7A7A]">View all 12 →</button>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'linux', stars: '166k', lang: 'C', updated: '30m ago', private: false },
                    { name: 'git', stars: '51.2k', lang: 'C', updated: '2h ago', private: false },
                    { name: 'subsurface', stars: '712', lang: 'C++', updated: '1d ago', private: false },
                    { name: 'private-notes', stars: '-', lang: 'Markdown', updated: '2d ago', private: true },
                  ].map((repo, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F5F5F5] last:border-0">
                      <WireBox width={28} height={28} label="" className="flex-shrink-0 text-[8px]" />
                      <button onClick={() => onNav('repo')} className="flex-1 font-medium text-sm text-[#1A1A1A] hover:underline text-left">{repo.name}</button>
                      {repo.private && <span className="wire-chip text-[10px] py-0 px-1.5">Private</span>}
                      {!repo.private && <WireStarCount count={repo.stars} />}
                      <WireLangDot lang={repo.lang} />
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{repo.updated}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent activity */}
              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Recent Activity</div>
                <div className="space-y-3">
                  {[
                    { icon: '↑', event: 'Pushed 3 commits to linux', time: '30m ago' },
                    { icon: '⭐', event: 'Starred denoland/deno', time: '2h ago' },
                    { icon: '✓', event: 'Merged PR #14821 in linux', time: '4h ago' },
                    { icon: '💬', event: 'Commented on torvalds/linux#4820', time: '6h ago' },
                    { icon: '📌', event: 'Saved vitejs/vite', time: '1d ago' },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="wire-box w-6 h-6 rounded text-[11px] flex-shrink-0">{act.icon}</div>
                      <span className="flex-1 text-xs text-[#4A4A4A]">{act.event}</span>
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <WireSidebarSection title="Quick Actions">
                <div className="space-y-1.5">
                  {[
                    { label: 'New repository', icon: '+' },
                    { label: 'Import repository', icon: '↓' },
                    { label: 'View saved items', icon: '♡' },
                    { label: 'Edit profile', icon: '✎' },
                    { label: 'Settings', icon: '⚙' },
                  ].map((a, i) => (
                    <button key={i} onClick={() => i === 2 && onNav('saved')} className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-[#4A4A4A] hover:bg-[#F5F5F5] text-left">
                      <span className="w-4 text-center font-mono">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </WireSidebarSection>

              <WireSidebarSection title="Your Feed">
                <div className="space-y-2">
                  {[
                    { repo: 'vitejs/vite', event: 'released v5.2', time: '1h ago' },
                    { repo: 'sveltejs/svelte', event: 'merged 5 PRs', time: '3h ago' },
                    { repo: 'shadcn/ui', event: 'new release', time: '5h ago' },
                  ].map((f, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <WireBox width={20} height={20} label="" className="flex-shrink-0 text-[7px] mt-0.5" />
                      <div>
                        <button onClick={() => onNav('repo')} className="text-xs font-medium text-[#1A1A1A] hover:underline">{f.repo}</button>
                        <div className="text-[11px] text-[#9A9A9A]">{f.event} · {f.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </WireSidebarSection>

              <WireSidebarSection title="Top Languages">
                <div className="space-y-2">
                  {[{ name: 'C', pct: 74 }, { name: 'C++', pct: 16 }, { name: 'Python', pct: 5 }, { name: 'Shell', pct: 5 }].map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-[#4A4A4A] w-16">{l.name}</span>
                      <div className="flex-1 h-1.5 bg-[#EBEBEB] rounded-full">
                        <div className="h-full bg-[#5A5A5A] rounded-full" style={{ width: `${l.pct}%` }} />
                      </div>
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{l.pct}%</span>
                    </div>
                  ))}
                </div>
              </WireSidebarSection>
            </div>
          </div>
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="wire-card p-4">
              <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Commit Activity</div>
              <WireChart height={120} type="bar" label="commits/week" />
            </div>
            <div className="wire-card p-4">
              <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Followers Growth</div>
              <WireChart height={120} type="area" label="followers over time" />
            </div>
            <div className="wire-card p-4">
              <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Stars Earned</div>
              <WireChart height={120} type="line" label="stars/month" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="wire-card p-4">
              <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">PR Merge Rate</div>
              <WireChart height={100} type="bar" label="merged vs closed" className="w-full" />
            </div>
            <div className="wire-card p-4">
              <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Issue Resolution</div>
              <WireChart height={100} type="line" label="open vs closed issues" className="w-full" />
            </div>
          </div>
        </div>
      )}

      {tab === 'Recommendations' && (
        <div className="grid grid-cols-[1fr_280px] gap-5">
          <div className="space-y-3">
            <div className="text-xs text-[#7A7A7A] mb-1">Based on your saved items and activity</div>
            {[
              { name: 'tauri-apps/tauri', desc: 'Build smaller, faster, and more secure desktop applications', stars: '78.4k', lang: 'Rust', match: 94 },
              { name: 'zed-industries/zed', desc: 'Code at the speed of thought', stars: '38.2k', lang: 'Rust', match: 91 },
              { name: 'oven-sh/bun', desc: 'Incredibly fast JavaScript runtime', stars: '71.8k', lang: 'Zig', match: 88 },
              { name: 'astro-build/astro', desc: 'The web framework for content-driven websites', stars: '44.2k', lang: 'TypeScript', match: 85 },
            ].map((repo, i) => (
              <div key={i} className="wire-card p-4 flex items-start gap-3">
                <WireBox width={36} height={36} label="" className="flex-shrink-0 text-[8px]" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => onNav('repo')} className="font-semibold text-sm text-[#1A1A1A] hover:underline">{repo.name}</button>
                    <span className="text-[11px] font-mono bg-[#F0F0F0] px-2 py-0.5 rounded text-[#4A4A4A]">{repo.match}% match</span>
                  </div>
                  <p className="text-xs text-[#7A7A7A] mt-0.5 mb-2">{repo.desc}</p>
                  <div className="flex gap-3">
                    <WireStarCount count={repo.stars} />
                    <WireLangDot lang={repo.lang} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <WireSidebarSection title="Developers to Follow">
              {[
                { name: 'Sindre Sorhus', handle: 'sindresorhus' },
                { name: 'Andrej Karpathy', handle: 'karpathy' },
                { name: 'Ryan Dahl', handle: 'ry' },
              ].map((dev, i) => (
                <div key={i} className="flex items-center gap-2 mb-3 last:mb-0">
                  <WireBox width={32} height={32} rounded label="" className="flex-shrink-0 text-[8px]" />
                  <div className="flex-1">
                    <button onClick={() => onNav('profile')} className="text-xs font-medium text-[#1A1A1A] hover:underline">{dev.name}</button>
                    <div className="text-[11px] text-[#9A9A9A]">@{dev.handle}</div>
                  </div>
                  <button className="wire-btn wire-btn-secondary text-[11px] py-1 px-2">Follow</button>
                </div>
              ))}
            </WireSidebarSection>
          </div>
        </div>
      )}
    </div>
  );
}
