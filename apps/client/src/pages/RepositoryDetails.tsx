import React, { useState, useEffect } from 'react';
import {
  Avatar,
  VectorChart,
  SaveButton,
  DevTabs,
  MetricCard,
  LanguageBar,
  SidebarSection,
} from '../components/DevComponents';
import { getFullRepository } from '../services/githubApi';
import { useDevHubStore } from '../store/useDevHubStore';

import { useNavigate, useSearchParams } from 'react-router-dom';

export function RepositoryDetailsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [starred, setStarred] = useState(false);
  const [watched, setWatched] = useState(false);
  const [searchParams] = useSearchParams();
  const owner = searchParams.get('owner') ?? '';
  const repo = searchParams.get('repo') ?? '';
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) {
      setError('Missing owner or repo in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    getFullRepository(owner, repo)
      .then(data => setRepoData(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, repo]);

  if (loading) return <div className="flex items-center justify-center h-full text-[#8b949e]">Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  const { savedRepos, toggleSaveRepo } = useDevHubStore();
  const isSaved = savedRepos.includes(`${owner}/${repo}`);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Repository Main Header Banner */}
      <div className="dev-card p-5 mb-5 border border-[#30363d]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5">
                          <Avatar name={repoData?.repo?.owner ?? ''} size={48} rounded={false} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-[#8b949e] hover:text-[#2f81f7] text-sm font-mono hover:underline"
                  >
                    {repoData?.repo?.owner ?? ''}
                  </button>
                  <span className="text-[#414754]">/</span>
                  <span className="font-bold text-[#f0f6fc] text-xl font-mono">
                    {repoData?.repo?.name ?? ''}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                    {repoData?.repo?.private ? 'Private' : 'Public'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                    {repoData?.repo?.default_branch ?? ''} branch
                  </span>
                </div>
                <p className="text-sm text-[#8b949e] mt-1.5 leading-relaxed">
                  {repoData?.repo?.description ?? ''}
                </p>
                <div className="flex gap-1.5 flex-wrap mt-2.5">
                  {repoData?.repo?.topics?.map((topic:string) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setWatched(!watched)}
              className={`dev-btn dev-btn-secondary text-xs gap-1.5 ${
                watched ? 'border-[#2f81f7] text-[#2f81f7]' : ''
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="8" cy="8" r="2.5" />
                <path d="M1.5 8C3 4 5.2 2 8 2s5 2 6.5 6c-1.5 4-3.7 6-6.5 6s-5-2-6.5-6z" />
              </svg>
              <span>{watched ? 'Watching' : 'Watch'}</span>
              <span className="text-[10px] font-mono opacity-80">8.2k</span>
            </button>

            <button
              onClick={() => setStarred(!starred)}
              className={`dev-btn text-xs gap-1.5 ${
                starred ? 'dev-btn-primary' : 'dev-btn-secondary'
              }`}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 16 16"
                fill={starred ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <polygon points="8,2 10,6 14.5,6.5 11,10 12,14.5 8,12 4,14.5 5,10 1.5,6.5 6,6" />
              </svg>
              <span>{starred ? 'Starred' : 'Star'}</span>
              <span className="text-[10px] font-mono opacity-80">166k</span>
            </button>

            <button className="dev-btn dev-btn-secondary text-xs gap-1.5">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
                <path d="M5 4.5v3l3 2 3-2V4.5" />
              </svg>
              <span>Fork</span>
              <span className="text-[10px] font-mono opacity-80">50.4k</span>
            </button>

            <SaveButton
              saved={isSaved}
              onToggle={() => toggleSaveRepo(`${owner}/${repo}`)}
            />
          </div>
        </div>
      </div>

      {/* 5-Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Stars" value={repoData?.repo?.stargazers_count?.toLocaleString() ?? '-'} sublabel="" />
        <MetricCard label="Forks" value={repoData?.repo?.forks_count?.toLocaleString() ?? '-'} sublabel="" />
        <MetricCard label="Open Issues" value={repoData?.repo?.open_issues_count?.toLocaleString() ?? '-'} sublabel="" />
        <MetricCard label="Contributors" value={repoData?.contributors?.length?.toLocaleString() ?? '-'} sublabel="" />
        <MetricCard label="Commits" value={repoData?.commits?.length?.toLocaleString() ?? '-'} sublabel="" />
      </div>

      {/* Navigation Tabs */}
      <DevTabs
        tabs={['Overview', 'Code', 'Issues', 'Pull Requests', 'Analytics']}
        active={tab}
        onChange={setTab}
        className="mb-5"
        counts={{
          Issues: 324,
          'Pull Requests': 78,
        }}
      />

      {/* Tab Panels */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left Column: Language & Commits */}
          <div className="space-y-5">
            {/* Language Breakdown Card */}
            <div className="dev-card p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                  Languages Breakdown
                </span>
                <span className="text-xs text-[#8b949e] font-mono">1.1 GB total code</span>
              </div>
              <LanguageBar
                langs={[
                  { name: 'C', pct: 97.4, color: '#555555' },
                  { name: 'Assembly', pct: 1.2, color: '#6E4C13' },
                  { name: 'Makefile', pct: 0.6, color: '#427819' },
                  { name: 'Python', pct: 0.4, color: '#3572A5' },
                  { name: 'Shell', pct: 0.4, color: '#89e051' },
                ]}
              />
            </div>

            {/* Recent Commits Timeline */}
            <div className="dev-card p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                    Recent Commits
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#21262d] text-[#8b949e]">
                    main
                  </span>
                </div>
                <span className="text-xs text-[#2f81f7] hover:underline cursor-pointer">
                  View commit history →
                </span>
              </div>

              <div className="divide-y divide-[#21262d]">
                {repoData?.commits?.map((c:any) => (
                  <div key={c.sha} className="py-2.5 flex items-start justify-between gap-3 group">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <Avatar name={c.author?.login ?? ''} size={22} rounded={true} />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#f0f6fc] group-hover:text-[#2f81f7] transition-colors line-clamp-1">
                          {c.commit?.message}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#8b949e] font-mono mt-0.5">
                          <span className="text-[#c9d1d9]">{c.author?.login}</span>
                          <span>committed {c.commit?.author?.date ? new Date(c.commit.author.date).toLocaleDateString() : ''}</span>
                          {c.verified && (
                            <span className="px-1 py-0.2 rounded text-[9px] bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#0d1117] border border-[#30363d] text-[#2f81f7]">
                        {c.sha}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: About & Top Contributors */}
          <div className="space-y-5">
            {/* About Card */}
            <SidebarSection title="About">
              <div className="space-y-3 text-xs text-[#8b949e]">
                <p className="text-[#c9d1d9] leading-relaxed">
                  Linux kernel source tree and master distribution repository.
                </p>
                <div className="flex items-center gap-2">
                  <span>🌐</span>
                  <a href="https://www.kernel.org" target="_blank" rel="noreferrer" className="text-[#2f81f7] hover:underline font-mono">
                    www.kernel.org
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span>⚖️</span>
                  <span>GPL-2.0 License</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span>Release v6.12-rc3 (latest)</span>
                </div>
              </div>
            </SidebarSection>

            {/* Top Contributors Card */}
            <SidebarSection title="Top Contributors">
              <div className="space-y-2.5">
                {repoData?.contributors?.map((contrib:any) => (
                  <div key={contrib.login} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={contrib.login} size={26} rounded={true} />
                      <div>
                        <div className="text-xs font-medium text-[#f0f6fc]">
                          {contrib.login}
                        </div>
                        <div className="text-[10px] font-mono text-[#6e7681]">
                          @{contrib.login}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-[#c9d1d9]">
                        {contrib.contributions.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-mono text-[#6e7681]">commits</div>
                    </div>
                  </div>
                ))}
              </div>
            </SidebarSection>
          </div>
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="dev-card p-4">
              <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider mb-3">
                Commit Activity Frequency
              </div>
              <VectorChart height={160} type="area" label="Commits / Week (52 Weeks)" />
            </div>
            <div className="dev-card p-4">
              <div className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider mb-3">
                Pull Request Velocity
              </div>
              <VectorChart height={160} type="bar" label="PRs Merged Monthly" />
            </div>
          </div>
        </div>
      )}

      {['Code', 'Issues', 'Pull Requests'].includes(tab) && (
        <div className="dev-card p-10 text-center">
          <div className="text-sm font-semibold text-[#f0f6fc] mb-1">{tab} View</div>
          <div className="text-xs text-[#8b949e]">
            Live synchronized repository data for {tab.toLowerCase()} is enabled in Developer Canvas mode.
          </div>
        </div>
      )}
    </div>
  );
}
