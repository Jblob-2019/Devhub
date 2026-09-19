import React, { useState } from 'react';
import {
  WireBox, WireChart, WireSaveBtn, WireStarCount, WireForkCount, WireLangDot,
  WireSidebarSection, WireRateLimitAlert, WireSearch
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

// Local WireChip for Home (import from WireComponents)
function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`wire-chip ${active ? 'active' : ''}`}>{label}</button>
  );
}

const categories = ['All', 'JavaScript', 'Python', 'Rust', 'Go', 'TypeScript', 'React', 'AI/ML', 'DevOps', 'Web3', 'Mobile'];

const trendingRepos = [
  { name: 'vercel/next.js', desc: 'The React Framework for the Web', stars: '118k', forks: '26.3k', lang: 'JavaScript', updated: '2h ago' },
  { name: 'microsoft/vscode', desc: 'Visual Studio Code', stars: '156k', forks: '27.8k', lang: 'TypeScript', updated: '1h ago' },
  { name: 'torvalds/linux', desc: 'Linux kernel source tree', stars: '166k', forks: '50.4k', lang: 'C', updated: '30m ago' },
  { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', stars: '94.5k', forks: '12.1k', lang: 'Rust', updated: '4h ago' },
  { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision', stars: '63.2k', forks: '7.4k', lang: 'Python', updated: '6h ago' },
];

const developers = [
  { name: 'Linus Torvalds', handle: 'torvalds', repos: 12, followers: '241k' },
  { name: 'Evan You', handle: 'yyx990803', repos: 48, followers: '88.2k' },
  { name: 'TJ Holowaychuk', handle: 'tj', repos: 312, followers: '47.1k' },
];

export function HomePage({ onNav }: { onNav: (page: Page) => void }) {
  const [cat, setCat] = useState('All');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [saved, setSaved] = useState<Record<number, boolean>>({});

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Rate limit alert */}
      {!alertDismissed && (
        <div className="mb-4">
          <WireRateLimitAlert onDismiss={() => setAlertDismissed(true)} />
        </div>
      )}

      {/* Hero search */}
      <div className="wire-card bg-[#F9F9F9] p-10 rounded-lg mb-6 flex flex-col items-center text-center gap-4">
        <div className="annotation mb-1">hero / search section</div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Discover GitHub repositories & developers</h1>
        <p className="text-sm text-[#7A7A7A] max-w-md">Explore trending repositories, discover top contributors, and build your developer feed.</p>
        <WireSearch
          placeholder="Search for repositories, developers, topics..."
          onSubmit={() => onNav('explore')}
          size="lg"
          className="w-full max-w-xl"
        />
        <div className="flex gap-2 flex-wrap justify-center mt-1">
          <span className="text-xs text-[#9A9A9A]">Popular:</span>
          {['react', 'machine-learning', 'rust', 'nextjs', 'llm'].map(t => (
            <button key={t} onClick={() => onNav('explore')} className="text-xs text-[#4A4A4A] underline underline-offset-2">{t}</button>
          ))}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(c => (
          <Chip key={c} label={c} active={cat === c} onClick={() => setCat(c)} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Main feed */}
        <div className="space-y-6">
          {/* Featured repo */}
          <div className="wire-card p-5 border-l-4 border-l-[#3A3A3A]">
            <div className="annotation mb-2">featured repository</div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3 flex-1">
                <WireBox width={44} height={44} label="logo" className="flex-shrink-0 text-[9px]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button onClick={() => onNav('repo')} className="font-semibold text-[#1A1A1A] hover:underline">vercel/next.js</button>
                    <span className="wire-chip text-[11px] py-0.5 px-2">Featured</span>
                  </div>
                  <p className="text-sm text-[#4A4A4A] mb-3">The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create high-quality web applications.</p>
                  <div className="flex items-center gap-4 flex-wrap">
                    <WireStarCount count="118k" />
                    <WireForkCount count="26.3k" />
                    <WireLangDot lang="JavaScript" />
                    <span className="text-xs text-[#9A9A9A] font-mono">Updated 2h ago</span>
                  </div>
                  <div className="mt-3">
                    <WireLangBar langs={[
                      { name: 'TypeScript', pct: 68 }, { name: 'JavaScript', pct: 22 }, { name: 'CSS', pct: 7 }, { name: 'Other', pct: 3 }
                    ]} />
                  </div>
                </div>
              </div>
              <WireSaveBtn saved={saved[0]} onToggle={() => setSaved(s => ({ ...s, 0: !s[0] }))} />
            </div>
          </div>

          {/* Trending repos section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">Trending Repositories</h2>
              <button onClick={() => onNav('explore')} className="text-xs text-[#7A7A7A] hover:text-[#3A3A3A]">View all →</button>
            </div>
            <div className="space-y-3">
              {trendingRepos.map((repo, i) => (
                <div key={i} className="wire-card p-4 flex items-start gap-3">
                  <span className="text-xs font-mono text-[#9A9A9A] w-5 flex-shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <WireBox width={32} height={32} label="" className="flex-shrink-0 text-[8px]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => onNav('repo')} className="font-medium text-[#1A1A1A] hover:underline text-sm leading-tight">{repo.name}</button>
                      <WireSaveBtn saved={saved[i + 1]} onToggle={() => setSaved(s => ({ ...s, [i + 1]: !s[i + 1] }))} />
                    </div>
                    <p className="text-xs text-[#7A7A7A] mt-0.5 mb-2 line-clamp-1">{repo.desc}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <WireStarCount count={repo.stars} />
                      <WireForkCount count={repo.forks} />
                      <WireLangDot lang={repo.lang} />
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{repo.updated}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer spotlight */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">Developer Spotlight</h2>
              <button onClick={() => onNav('explore')} className="text-xs text-[#7A7A7A] hover:text-[#3A3A3A]">View all →</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {developers.map((dev, i) => (
                <div key={i} className="wire-card p-4 flex flex-col items-center text-center gap-2">
                  <WireBox width={52} height={52} rounded label="" />
                  <div>
                    <button onClick={() => onNav('profile')} className="font-medium text-sm text-[#1A1A1A] hover:underline block">{dev.name}</button>
                    <span className="text-xs text-[#9A9A9A]">@{dev.handle}</span>
                  </div>
                  <div className="flex gap-3 text-xs text-[#7A7A7A]">
                    <span>{dev.repos} repos</span>
                    <span>{dev.followers} followers</span>
                  </div>
                  <button onClick={() => onNav('profile')} className="wire-btn wire-btn-secondary text-xs py-1 w-full">View Profile</button>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[#1A1A1A]">Recommended for You</h2>
              <span className="annotation">based on activity</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'shadcn/ui', desc: 'Beautifully designed components built with Radix UI and Tailwind CSS.', stars: '58.2k', lang: 'TypeScript' },
                { name: 'supabase/supabase', desc: 'The open source Firebase alternative.', stars: '65.8k', lang: 'TypeScript' },
                { name: 'trpc/trpc', desc: 'Move Fast and Break Nothing. End-to-end typesafe APIs made easy.', stars: '32.4k', lang: 'TypeScript' },
              ].map((repo, i) => (
                <div key={i} className="wire-card p-4 flex items-start justify-between gap-3">
                  <div>
                    <button onClick={() => onNav('repo')} className="font-medium text-sm text-[#1A1A1A] hover:underline">{repo.name}</button>
                    <p className="text-xs text-[#7A7A7A] mt-0.5 mb-2">{repo.desc}</p>
                    <div className="flex gap-3">
                      <WireStarCount count={repo.stars} />
                      <WireLangDot lang={repo.lang} />
                    </div>
                  </div>
                  <WireSaveBtn saved={saved[20 + i]} onToggle={() => setSaved(s => ({ ...s, [20 + i]: !s[20 + i] }))} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <WireSidebarSection title="Trending Topics" action={{ label: 'See all', onClick: () => onNav('explore') }}>
            <div className="flex flex-wrap gap-1.5">
              {['machine-learning', 'webassembly', 'rust', 'llm', 'kubernetes', 'react', 'deno', 'bun', 'typescript'].map(t => (
                <button key={t} onClick={() => onNav('explore')} className="wire-chip text-[11px]">{t}</button>
              ))}
            </div>
          </WireSidebarSection>

          <WireSidebarSection title="Activity Graph">
            <WireChart height={80} type="area" label="commits / week" className="w-full" />
          </WireSidebarSection>

          <WireSidebarSection title="Top Languages">
            <div className="space-y-2">
              {[
                { lang: 'TypeScript', pct: 38 }, { lang: 'Python', pct: 27 }, { lang: 'Rust', pct: 15 },
                { lang: 'Go', pct: 11 }, { lang: 'Other', pct: 9 }
              ].map((l, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-[#4A4A4A] w-20">{l.lang}</span>
                  <div className="flex-1 h-1.5 bg-[#EBEBEB] rounded-full">
                    <div className="h-full bg-[#5A5A5A] rounded-full" style={{ width: `${l.pct}%` }} />
                  </div>
                  <span className="text-[11px] text-[#9A9A9A] font-mono w-7 text-right">{l.pct}%</span>
                </div>
              ))}
            </div>
          </WireSidebarSection>

          <WireSidebarSection title="Quick Actions">
            <div className="space-y-2">
              {[
                { label: 'Import from GitHub', icon: '↓' },
                { label: 'View my dashboard', icon: '◈' },
                { label: 'Manage saved items', icon: '♡' },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => onNav(i === 1 ? 'dashboard' : i === 2 ? 'saved' : 'login')}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-[#4A4A4A] hover:bg-[#F5F5F5] text-left"
                >
                  <span className="w-4 text-center">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </WireSidebarSection>

          <WireSidebarSection title="Recently Viewed">
            <div className="space-y-2">
              {['facebook/react', 'golang/go', 'denoland/deno'].map((r, i) => (
                <button
                  key={i}
                  onClick={() => onNav('repo')}
                  className="flex items-center gap-2 w-full hover:bg-[#F5F5F5] rounded px-1 py-1"
                >
                  <WireBox width={20} height={20} label="" className="text-[7px] flex-shrink-0" />
                  <span className="text-xs text-[#4A4A4A] text-left">{r}</span>
                </button>
              ))}
            </div>
          </WireSidebarSection>
        </div>
      </div>
    </div>
  );
}

// WireLangBar component (local copy since it depends on this file scope)
function WireLangBar({ langs }: { langs: { name: string; pct: number }[] }) {
  return (
    <div>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-px">
        {langs.map((l, i) => {
          const shades = ['#3A3A3A', '#6A6A6A', '#8A8A8A', '#AAAAAA', '#C0C0C0'];
          return <div key={i} style={{ width: `${l.pct}%`, background: shades[i % shades.length] }} />;
        })}
      </div>
    </div>
  );
}
