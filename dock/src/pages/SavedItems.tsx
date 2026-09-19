import React, { useState } from 'react';
import {
  WireBox, WireStarCount, WireForkCount, WireLangDot, WireSaveBtn,
  WireTabs, WireEmpty, WireSearch
} from '../components/WireComponents';

type Page = 'home' | 'explore' | 'profile' | 'repo' | 'saved' | 'dashboard' | 'login' | 'register';

const savedRepos = [
  { name: 'vercel/next.js', desc: 'The React Framework for the Web', stars: '118k', forks: '26.3k', lang: 'JavaScript', savedAt: '2h ago' },
  { name: 'microsoft/vscode', desc: 'Visual Studio Code', stars: '156k', forks: '27.8k', lang: 'TypeScript', savedAt: '1d ago' },
  { name: 'rust-lang/rust', desc: 'Empowering everyone to build reliable and efficient software.', stars: '94.5k', forks: '12.1k', lang: 'Rust', savedAt: '3d ago' },
  { name: 'denoland/deno', desc: 'A modern runtime for JavaScript and TypeScript.', stars: '92.8k', forks: '5.1k', lang: 'Rust', savedAt: '1w ago' },
  { name: 'vitejs/vite', desc: 'Next generation frontend tooling.', stars: '66.3k', forks: '5.8k', lang: 'TypeScript', savedAt: '2w ago' },
];

const savedDevs = [
  { name: 'Linus Torvalds', handle: 'torvalds', repos: 12, followers: '241k', savedAt: '1d ago' },
  { name: 'Evan You', handle: 'yyx990803', repos: 48, followers: '88.2k', savedAt: '5d ago' },
  { name: 'Rich Harris', handle: 'Rich-Harris', repos: 64, followers: '36.8k', savedAt: '2w ago' },
];

const recentlyViewed = [
  { type: 'repo', name: 'facebook/react', time: '10m ago' },
  { type: 'dev', name: 'sindresorhus', time: '25m ago' },
  { type: 'repo', name: 'golang/go', time: '1h ago' },
  { type: 'repo', name: 'openai/whisper', time: '2h ago' },
  { type: 'dev', name: 'karpathy', time: '3h ago' },
];

export function SavedItemsPage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Repositories');
  const [query, setQuery] = useState('');
  const [savedState, setSavedState] = useState<Record<number, boolean>>(
    Object.fromEntries(savedRepos.map((_, i) => [i, true]))
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Saved Items</h1>
          <p className="text-sm text-[#7A7A7A] mt-0.5">Your bookmarked repositories and developers</p>
        </div>
        <span className="annotation">saved / bookmarks page</span>
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <WireSearch
              placeholder="Filter saved items..."
              value={query}
              onChange={setQuery}
              className="flex-1 max-w-sm"
            />
            <WireTabs
              tabs={['Repositories', 'Developers', 'Collections']}
              active={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'Repositories' && (
            <div className="space-y-3">
              {savedRepos.length === 0 ? (
                <WireEmpty
                  title="No saved repositories"
                  subtitle="Browse repositories and save ones you want to revisit."
                  action="Explore repositories"
                />
              ) : savedRepos.map((repo, i) => (
                <div key={i} className="wire-card p-4 flex items-start gap-3">
                  <WireBox width={36} height={36} label="" className="flex-shrink-0 text-[8px]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <button onClick={() => onNav('repo')} className="font-semibold text-sm text-[#1A1A1A] hover:underline">{repo.name}</button>
                        <p className="text-xs text-[#7A7A7A] mt-0.5 mb-2">{repo.desc}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-[#9A9A9A] font-mono">saved {repo.savedAt}</span>
                        <WireSaveBtn
                          saved={savedState[i]}
                          onToggle={() => setSavedState(s => ({ ...s, [i]: !s[i] }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <WireStarCount count={repo.stars} />
                      <WireForkCount count={repo.forks} />
                      <WireLangDot lang={repo.lang} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Developers' && (
            <div className="space-y-3">
              {savedDevs.map((dev, i) => (
                <div key={i} className="wire-card p-4 flex items-center gap-3">
                  <WireBox width={44} height={44} rounded label="" className="flex-shrink-0 text-[9px]" />
                  <div className="flex-1">
                    <button onClick={() => onNav('profile')} className="font-semibold text-sm text-[#1A1A1A] hover:underline">{dev.name}</button>
                    <div className="text-xs text-[#9A9A9A]">@{dev.handle}</div>
                    <div className="flex gap-3 text-xs text-[#7A7A7A] mt-1">
                      <span>{dev.followers} followers</span>
                      <span>{dev.repos} repos</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[11px] text-[#9A9A9A] font-mono">saved {dev.savedAt}</span>
                    <WireSaveBtn saved onToggle={() => {}} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Collections' && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-[#7A7A7A]">Organize saved items into collections</span>
                <button className="wire-btn wire-btn-secondary text-xs">+ New Collection</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Frontend Frameworks', count: 8, icon: '🎨' },
                  { name: 'AI / ML Tools', count: 5, icon: '🤖' },
                  { name: 'DevOps & Infra', count: 12, icon: '⚙️' },
                  { name: 'Languages & Runtimes', count: 6, icon: '💻' },
                ].map((col, i) => (
                  <div key={i} className="wire-card p-4 flex items-center gap-3 cursor-pointer hover:bg-[#F9F9F9]">
                    <div className="wire-box w-10 h-10 rounded text-sm flex-shrink-0">{col.icon}</div>
                    <div>
                      <div className="font-medium text-sm text-[#1A1A1A]">{col.name}</div>
                      <div className="text-xs text-[#9A9A9A]">{col.count} items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recently viewed */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Recently Viewed</div>
            <div className="space-y-2">
              {recentlyViewed.map((item, i) => (
                <button
                  key={i}
                  onClick={() => onNav(item.type === 'repo' ? 'repo' : 'profile')}
                  className="flex items-center gap-2 w-full hover:bg-[#F5F5F5] rounded px-1 py-1"
                >
                  <WireBox width={22} height={22} rounded={item.type === 'dev'} label="" className="flex-shrink-0 text-[8px]" />
                  <span className="text-xs text-[#4A4A4A] flex-1 text-left">{item.name}</span>
                  <span className="text-[10px] text-[#B0B0B0] font-mono">{item.time}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Your Interests</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {['TypeScript', 'React', 'Rust', 'WebAssembly', 'LLM', 'DevOps'].map(t => (
                <span key={t} className="wire-chip text-[11px] active">{t}</span>
              ))}
            </div>
            <button className="wire-btn wire-btn-secondary text-xs w-full">Edit interests</button>
          </div>

          {/* Quick actions */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Quick Actions</div>
            <div className="space-y-1.5">
              {[
                { label: 'Export saved items', icon: '↗' },
                { label: 'Import from GitHub stars', icon: '↓' },
                { label: 'Share collection', icon: '⎘' },
              ].map((a, i) => (
                <button key={i} className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-[#4A4A4A] hover:bg-[#F5F5F5] text-left">
                  <span className="w-4 text-center font-mono">{a.icon}</span>
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="wire-card p-4">
            <div className="text-xs font-semibold text-[#4A4A4A] mb-3 uppercase tracking-wider">Recommended</div>
            <div className="space-y-2">
              {[
                { name: 'shadcn/ui', stars: '58.2k', lang: 'TypeScript' },
                { name: 'trpc/trpc', stars: '32.4k', lang: 'TypeScript' },
                { name: 'tauri-apps/tauri', stars: '78.4k', lang: 'Rust' },
              ].map((repo, i) => (
                <div key={i} className="flex items-center gap-2">
                  <WireBox width={22} height={22} label="" className="flex-shrink-0 text-[8px]" />
                  <button onClick={() => onNav('repo')} className="flex-1 text-xs text-[#4A4A4A] hover:underline text-left">{repo.name}</button>
                  <WireStarCount count={repo.stars} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
