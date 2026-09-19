import React, { useState } from 'react';
import {
  WireBox, WireStarCount, WireForkCount, WireLangDot, WireSaveBtn,
  WireTabs, WireSearch, WireFilterPanel, WireSortBar, WirePagination, WireEmpty
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

const repos = [
  { name: 'vercel/next.js', desc: 'The React Framework for the Web', stars: '118k', forks: '26.3k', lang: 'JavaScript', topics: ['react', 'framework', 'ssr'], updated: '2h ago' },
  { name: 'microsoft/vscode', desc: 'Visual Studio Code', stars: '156k', forks: '27.8k', lang: 'TypeScript', topics: ['editor', 'ide'], updated: '1h ago' },
  { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', stars: '94.5k', forks: '12.1k', lang: 'Rust', topics: ['systems', 'compiler'], updated: '4h ago' },
  { name: 'openai/whisper', desc: 'Robust Speech Recognition via Large-Scale Weak Supervision', stars: '63.2k', forks: '7.4k', lang: 'Python', topics: ['ai', 'speech', 'ml'], updated: '6h ago' },
  { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript.', stars: '92.8k', forks: '5.1k', lang: 'Rust', topics: ['runtime', 'javascript'], updated: '3h ago' },
  { name: 'vitejs/vite', desc: 'Next generation frontend tooling.', stars: '66.3k', forks: '5.8k', lang: 'TypeScript', topics: ['build', 'frontend'], updated: '5h ago' },
];

const devs = [
  { name: 'Linus Torvalds', handle: 'torvalds', bio: 'Creator of Linux and Git', repos: 12, followers: '241k', following: 0, lang: 'C' },
  { name: 'Evan You', handle: 'yyx990803', bio: 'Creator of Vue.js and Vite', repos: 48, followers: '88.2k', following: 32, lang: 'TypeScript' },
  { name: 'Sindre Sorhus', handle: 'sindresorhus', bio: 'Full-Time Open-Sourcerer', repos: 1200, followers: '47.3k', following: 12, lang: 'JavaScript' },
  { name: 'Rich Harris', handle: 'Rich-Harris', bio: 'Creator of Svelte and Rollup', repos: 64, followers: '36.8k', following: 142, lang: 'TypeScript' },
  { name: 'TJ Holowaychuk', handle: 'tj', bio: 'Building great software', repos: 312, followers: '47.1k', following: 77, lang: 'Go' },
  { name: 'Andrej Karpathy', handle: 'karpathy', bio: 'AI/ML researcher', repos: 28, followers: '54.6k', following: 8, lang: 'Python' },
];

export function ExplorePage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Repositories');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState('Stars');
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [filterOpen, setFilterOpen] = useState(true);

  const repoFilters = [
    { label: 'Language', key: 'lang', options: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++'] },
    { label: 'Stars', key: 'stars', options: ['< 1k', '1k–10k', '10k–50k', '50k+'] },
    { label: 'Updated', key: 'updated', options: ['Today', 'This week', 'This month', 'This year'] },
    { label: 'License', key: 'license', options: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD'] },
  ];

  const devFilters = [
    { label: 'Language', key: 'lang', options: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go'] },
    { label: 'Followers', key: 'followers', options: ['< 1k', '1k–10k', '10k+', '100k+'] },
    { label: 'Repos', key: 'repos', options: ['< 10', '10–50', '50–200', '200+'] },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-xl font-bold text-[#1A1A1A]">Explore</h1>
          <span className="annotation">search & discovery</span>
        </div>
        <WireSearch
          placeholder={tab === 'Repositories' ? 'Search repositories by name, topic, description...' : 'Search developers by username, name, bio...'}
          value={query}
          onChange={setQuery}
          size="lg"
          className="max-w-2xl"
        />
      </div>

      {/* Tabs + sort */}
      <div className="flex items-center justify-between mb-4">
        <WireTabs
          tabs={['Repositories', 'Developers']}
          active={tab}
          onChange={t => { setTab(t); setPage(1); }}
        />
        <div className="flex items-center gap-4">
          <WireSortBar
            options={tab === 'Repositories' ? ['Stars', 'Forks', 'Updated', 'Relevance'] : ['Followers', 'Repos', 'Relevance']}
            value={sort}
            onChange={setSort}
          />
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="wire-btn wire-btn-secondary text-xs gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M5 8h6M7 12h2" strokeLinecap="round" />
            </svg>
            Filters {filterOpen ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* Filter sidebar */}
        {filterOpen && (
          <div className="wire-card p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-[#3A3A3A] uppercase tracking-wider">Filters</span>
              {Object.keys(filters).length > 0 && (
                <button onClick={() => setFilters({})} className="text-xs text-[#7A7A7A] hover:text-[#1A1A1A]">Clear all</button>
              )}
            </div>
            <WireFilterPanel
              filters={tab === 'Repositories' ? repoFilters : devFilters}
              values={filters}
              onChange={(k, v) => setFilters(f => ({ ...f, [k]: f[k] === v ? '' : v }))}
            />
          </div>
        )}

        {/* Results */}
        <div>
          <div className="text-xs text-[#7A7A7A] mb-3 font-mono">
            {tab === 'Repositories' ? `${repos.length * 4},821` : `${devs.length * 3},142`} results
            {query && ` for "${query}"`}
          </div>

          {tab === 'Repositories' ? (
            <div className="space-y-3">
              {repos.map((repo, i) => (
                <div key={i} className="wire-card p-4 flex items-start gap-3">
                  <WireBox width={36} height={36} label="" className="flex-shrink-0 text-[8px]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button onClick={() => onNav('repo')} className="font-semibold text-[#1A1A1A] hover:underline text-sm">{repo.name}</button>
                        <p className="text-xs text-[#7A7A7A] mt-0.5 mb-2">{repo.desc}</p>
                      </div>
                      <WireSaveBtn saved={saved[i]} onToggle={() => setSaved(s => ({ ...s, [i]: !s[i] }))} />
                    </div>
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <WireStarCount count={repo.stars} />
                      <WireForkCount count={repo.forks} />
                      <WireLangDot lang={repo.lang} />
                      <span className="text-[11px] text-[#9A9A9A] font-mono">{repo.updated}</span>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {repo.topics.map(t => (
                        <span key={t} className="wire-chip text-[11px] py-0.5 px-2">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {devs.map((dev, i) => (
                <div key={i} className="wire-card p-4 flex gap-3">
                  <WireBox width={48} height={48} rounded label="" className="flex-shrink-0 text-[9px]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <button onClick={() => onNav('profile')} className="font-semibold text-sm text-[#1A1A1A] hover:underline">{dev.name}</button>
                        <div className="text-xs text-[#9A9A9A]">@{dev.handle}</div>
                      </div>
                      <WireSaveBtn saved={saved[100 + i]} onToggle={() => setSaved(s => ({ ...s, [100 + i]: !s[100 + i] }))} />
                    </div>
                    <p className="text-xs text-[#7A7A7A] mt-1 mb-2 line-clamp-1">{dev.bio}</p>
                    <div className="flex gap-3 text-xs text-[#7A7A7A] mb-2">
                      <span>{dev.followers} followers</span>
                      <span>{dev.repos} repos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <WireLangDot lang={dev.lang} />
                      <button onClick={() => onNav('profile')} className="wire-btn wire-btn-secondary text-xs py-1 ml-auto">Follow</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <WirePagination current={page} total={8} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
