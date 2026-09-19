import React, { useState } from 'react';
import {
  WireBox, WireChart, WireStarCount, WireForkCount, WireLangDot, WireSaveBtn,
  WireTabs, WireMetricCard, WireLangBar
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

const commits = [
  { sha: 'a3f91c2', msg: 'kernel: fix mm/memory.c null ptr dereference', author: 'torvalds', time: '2h ago' },
  { sha: 'b7e2d41', msg: 'net: tcp: improve RACK reordering detection', author: 'edumazet', time: '4h ago' },
  { sha: 'c1a8f33', msg: 'mm: fix use-after-free in mmap_region()', author: 'vbabka', time: '6h ago' },
  { sha: 'd4f2c19', msg: 'fs: ext4: fix crash in ext4_es_cache_extent()', author: 'tytso', time: '8h ago' },
  { sha: 'e5b3a77', msg: 'drivers: usb: fix oops when disconnecting', author: 'gregkh', time: '12h ago' },
];

const contributors = [
  { handle: 'torvalds', commits: 24816 },
  { handle: 'gregkh', commits: 16234 },
  { handle: 'tytso', commits: 9821 },
  { handle: 'akpm', commits: 8743 },
  { handle: 'davem330', commits: 7632 },
];

export function RepositoryDetailsPage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Overview');
  const [starred, setStarred] = useState(false);
  const [watched, setWatched] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Repo header */}
      <div className="wire-card p-5 mb-5">
        <div className="annotation mb-2">repository header</div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <WireBox width={48} height={48} label="logo" className="text-[9px] flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => onNav('profile')} className="text-[#7A7A7A] hover:underline text-sm">torvalds</button>
                <span className="text-[#C0C0C0]">/</span>
                <span className="font-bold text-[#1A1A1A] text-lg">linux</span>
                <span className="wire-chip text-[11px] py-0.5 px-2">Public</span>
              </div>
              <p className="text-sm text-[#4A4A4A] mt-1">Linux kernel source tree</p>
              <div className="flex gap-2 flex-wrap mt-2">
                {['kernel', 'linux', 'c', 'operating-system'].map(t => (
                  <span key={t} className="wire-chip text-[11px] py-0.5 px-2">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setWatched(w => !w)}
              className={`wire-btn wire-btn-secondary text-xs gap-1.5 ${watched ? 'bg-[#EBEBEB]' : ''}`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="2.5" /><path d="M1.5 8C3 4 5.2 2 8 2s5 2 6.5 6c-1.5 4-3.7 6-6.5 6s-5-2-6.5-6z" />
              </svg>
              {watched ? 'Watching' : 'Watch'} · 8.2k
            </button>
            <button
              onClick={() => setStarred(s => !s)}
              className={`wire-btn text-xs gap-1.5 ${starred ? 'wire-btn-primary' : 'wire-btn-secondary'}`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <polygon points="8,2 10,6 14.5,6.5 11,10 12,14.5 8,12 4,14.5 5,10 1.5,6.5 6,6" />
              </svg>
              {starred ? 'Starred' : 'Star'} · 166k
            </button>
            <button className="wire-btn wire-btn-secondary text-xs gap-1.5">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
                <path d="M5 4.5v3l3 2 3-2V4.5" />
              </svg>
              Fork · 50.4k
            </button>
            <WireSaveBtn saved={saved} onToggle={() => setSaved(s => !s)} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        <WireMetricCard label="Stars" value="166k" sublabel="↑ 2.3k/month" trend="up" />
        <WireMetricCard label="Forks" value="50.4k" sublabel="active forks" />
        <WireMetricCard label="Open Issues" value="324" sublabel="1.2k total" />
        <WireMetricCard label="Contributors" value="4,821" sublabel="all time" />
        <WireMetricCard label="Commits" value="1.1M" sublabel="main branch" />
      </div>

      {/* Tabs */}
      <WireTabs
        tabs={['Overview', 'Code', 'Issues', 'Pull Requests', 'Analytics']}
        active={tab}
        onChange={setTab}
        className="mb-5"
      />

      <div className="grid grid-cols-[1fr_280px] gap-5">
        {/* Main content */}
        <div>
          {tab === 'Overview' && (
            <div className="space-y-4">
              {/* README placeholder */}
              <div className="wire-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <WireBox width={20} height={20} label="" className="text-[8px]" />
                    <span className="font-medium text-sm text-[#1A1A1A]">README.md</span>
                  </div>
                  <span className="annotation">rendered markdown</span>
                </div>
                <div className="space-y-2">
                  <div className="wire-box h-6 rounded w-1/2 mb-3" />
                  {[100, 80, 90, 60, 85, 70, 95, 50].map((w, i) => (
                    <div key={i} className="wire-box h-3 rounded" style={{ width: `${w}%` }} />
                  ))}
                  <div className="mt-4">
                    <div className="wire-box h-5 rounded w-1/3 mb-2" />
                    {[75, 90, 65, 80].map((w, i) => (
                      <div key={i} className="wire-box h-3 rounded mt-1.5" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent commits */}
              <div className="wire-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">Recent Commits</span>
                  <button className="text-xs text-[#7A7A7A]">View all →</button>
                </div>
                <div className="space-y-2">
                  {commits.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-[#F0F0F0] last:border-0">
                      <WireBox width={24} height={24} rounded label="" className="flex-shrink-0 text-[8px]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[#1A1A1A] truncate">{c.msg}</div>
                        <div className="text-[11px] text-[#9A9A9A]">@{c.author} · {c.time}</div>
                      </div>
                      <span className="font-mono text-[11px] text-[#7A7A7A] bg-[#F4F4F4] px-1.5 py-0.5 rounded flex-shrink-0">{c.sha}</span>
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
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Commit Frequency</div>
                  <WireChart height={130} type="bar" label="commits/week" />
                </div>
                <div className="wire-card p-4">
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Stars Over Time</div>
                  <WireChart height={130} type="area" label="cumulative stars" />
                </div>
                <div className="wire-card p-4">
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Issue Velocity</div>
                  <WireChart height={130} type="line" label="opened vs closed" />
                </div>
                <div className="wire-card p-4">
                  <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Language Distribution</div>
                  <WireChart height={130} type="pie" label="by bytes" />
                </div>
              </div>
              <div className="wire-card p-4">
                <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Fork Network Growth</div>
                <WireChart height={100} type="area" label="forks over time" className="w-full" />
              </div>
            </div>
          )}

          {tab === 'Issues' && (
            <div className="space-y-2">
              <div className="flex gap-4 mb-3">
                {['Open (324)', 'Closed (1.2k)'].map((s, i) => (
                  <button key={i} className={`text-sm font-medium py-1.5 border-b-2 ${i === 0 ? 'border-[#1A1A1A] text-[#1A1A1A]' : 'border-transparent text-[#7A7A7A]'}`}>{s}</button>
                ))}
              </div>
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="wire-card p-3 flex items-start gap-3">
                  <div className="wire-box w-4 h-4 rounded-full mt-0.5 flex-shrink-0 text-[8px]">○</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#1A1A1A] mb-0.5">
                      {['mm: fix potential deadlock in compaction', 'net: tcp: revert overly aggressive RACK change', 'fs: btrfs: corruption on RAID6 rebuild'][i % 3]}
                    </div>
                    <div className="text-[11px] text-[#9A9A9A]">#{4821 + i} opened 3h ago by contributor_{i + 1}</div>
                    <div className="flex gap-1.5 mt-1">
                      {[['bug', 'mm'], ['networking', 'regression'], ['filesystem', 'btrfs']][i % 3].map(t => (
                        <span key={t} className="wire-chip text-[10px] py-0 px-1.5">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#9A9A9A] flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4h12v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" />
                      <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
                    </svg>
                    {(i + 1) * 3}
                  </div>
                </div>
              ))}
            </div>
          )}

          {(tab === 'Code' || tab === 'Pull Requests') && (
            <div className="wire-card p-6 flex flex-col items-center justify-center gap-3 min-h-[300px]">
              <WireBox width={48} height={48} label="" />
              <div className="text-sm text-[#4A4A4A] font-medium">{tab} view</div>
              <div className="annotation">file browser / PR list</div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* About */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">About</div>
            <p className="text-xs text-[#4A4A4A] mb-3">Linux kernel source tree. Updated daily from the official kernel tree.</p>
            <div className="space-y-2">
              {[
                { icon: '⭐', label: '166k stars' }, { icon: '🔱', label: '50.4k forks' },
                { icon: '👁', label: '8.2k watching' }, { icon: '📋', label: 'GPL-2.0 license' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#4A4A4A]">
                  <span className="w-4 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Languages</div>
            <WireLangBar langs={[
              { name: 'C', pct: 98 }, { name: 'Python', pct: 1 }, { name: 'Other', pct: 1 }
            ]} />
          </div>

          {/* Contributors */}
          <div className="wire-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">Top Contributors</span>
              <span className="text-[11px] text-[#9A9A9A]">4,821 total</span>
            </div>
            <div className="space-y-2">
              {contributors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <WireBox width={24} height={24} rounded label="" className="flex-shrink-0 text-[8px]" />
                  <button onClick={() => onNav('profile')} className="flex-1 text-xs text-[#4A4A4A] hover:underline text-left">{c.handle}</button>
                  <span className="text-[11px] text-[#9A9A9A] font-mono">{c.commits.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Releases */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Releases</div>
            <div className="space-y-2">
              {['v6.7', 'v6.6', 'v6.5'].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#3A3A3A]">{r}</span>
                  <span className="text-[11px] text-[#9A9A9A]">{['2w ago', '2mo ago', '4mo ago'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
