import React, { useState, useEffect, useCallback } from 'react';
import {
  Avatar,
  VectorChart,
  SaveButton,
  DevTabs,
  MetricCard,
  LanguageBar,
  SidebarSection,
  EmptyState,
} from '../components/DevComponents';
import { getFullRepository } from '../services/githubApi';
import { useDevHubStore } from '../store/useDevHubStore';

import { useNavigate, useSearchParams } from 'react-router-dom';

export function RepositoryDetailsPage() {
  const navigate = useNavigate();
  const { savedRepos, toggleSaveRepo } = useDevHubStore();
  const [tab, setTab] = useState('Overview');
  const [starred, setStarred] = useState(false);
  const [watched, setWatched] = useState(false);
  const [searchParams] = useSearchParams();
  const owner = searchParams.get('owner') ?? '';
  const repo = searchParams.get('repo') ?? '';
  const [repoData, setRepoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSaved = savedRepos?.includes(`${owner}/${repo}`) ?? false;

  const fetchRepository = useCallback(async () => {
    if (!owner || !repo) {
      setError('Missing owner or repo in URL');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getFullRepository(owner, repo);
      setRepoData(data);
    } catch (err: any) {
      const message = err?.message ?? 'Failed to load repository';
      if (message.includes('404') || message.includes('Not Found')) {
        setError(`Repository "${owner}/${repo}" not found`);
      } else if (message.includes('403') || message.includes('Forbidden') || message.includes('rate limit')) {
        setError('GitHub API rate limit exceeded or access forbidden. Please try again later.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchRepository();
  }, [fetchRepository]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <div className="dev-card p-5 mb-5 border border-[#30363d]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded border border-[#30363d] bg-[#21262d] animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-3/4 bg-[#21262d] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[#21262d] rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="dev-card p-3 animate-pulse">
              <div className="h-4 w-1/3 bg-[#21262d] rounded mb-1" />
              <div className="h-8 w-1/2 bg-[#21262d] rounded" />
            </div>
          ))}
        </div>
        <div className="dev-card p-4 animate-pulse">
          <div className="h-4 w-1/4 bg-[#21262d] rounded mb-3" />
          <div className="h-32 bg-[#21262d] rounded" />
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error || !repoData) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <EmptyState
          title={error ?? 'Repository not found'}
          subtitle={owner && repo ? `Could not load "${owner}/${repo}"` : 'Invalid repository URL. Please provide both owner and repo parameters.'}
          action="Retry"
          onAction={fetchRepository}
        />
      </div>
    );
  }

  const repoInfo = repoData.repo;

  // Extract owner info - GitHub returns owner as object with login/avatar_url
  const ownerLogin = repoInfo?.owner?.login ?? owner;
  const ownerAvatar = repoInfo?.owner?.avatar_url ?? '';

  // Convert languages object to array and calculate percentages
  const languagesArray = repoData?.languages
    ? Object.entries(repoData.languages).map(([name, bytes]) => ({ name, bytes: bytes as number }))
    : [];
  const totalBytes = languagesArray.reduce((sum, l) => sum + l.bytes, 0);
  const languagesWithPct = languagesArray
    .sort((a, b) => b.bytes - a.bytes)
    .map(l => ({ name: l.name, pct: totalBytes > 0 ? Math.round((l.bytes / totalBytes) * 100) : 0, bytes: l.bytes }));

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Repository Main Header Banner */}
      <div className="dev-card p-5 mb-5 border border-[#30363d]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3.5">
                          <Avatar name={ownerLogin} src={ownerAvatar} size={48} rounded={false} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => navigate(`/developer?username=${encodeURIComponent(ownerLogin)}`)}
                    className="text-[#8b949e] hover:text-[#2f81f7] text-sm font-mono hover:underline"
                  >
                    {ownerLogin}
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
              <span className="text-[10px] font-mono opacity-80">
                {repoInfo?.subscribers_count?.toLocaleString() ?? repoInfo?.watchers_count?.toLocaleString() ?? '—'}
              </span>
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
              <span className="text-[10px] font-mono opacity-80">
                {repoInfo?.stargazers_count?.toLocaleString() ?? '—'}
              </span>
            </button>

            <button className="dev-btn dev-btn-secondary text-xs gap-1.5">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="5" cy="3" r="1.5" />
                <circle cx="11" cy="3" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
                <path d="M5 4.5v3l3 2 3-2V4.5" />
              </svg>
              <span>Fork</span>
              <span className="text-[10px] font-mono opacity-80">
                {repoInfo?.forks_count?.toLocaleString() ?? '—'}
              </span>
            </button>

            <SaveButton
              saved={isSaved}
              onToggle={() => toggleSaveRepo?.(`${owner}/${repo}`)}
            />
          </div>
        </div>
      </div>

      {/* 5-Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricCard label="Stars" value={repoInfo?.stargazers_count?.toLocaleString() ?? '—'} sublabel="" />
        <MetricCard label="Forks" value={repoInfo?.forks_count?.toLocaleString() ?? '—'} sublabel="" />
        <MetricCard label="Open Issues" value={repoInfo?.open_issues_count?.toLocaleString() ?? '—'} sublabel="" />
        <MetricCard label="Contributors" value={repoData?.contributors?.length?.toLocaleString() ?? '—'} sublabel="" />
        <MetricCard label="Commits" value={repoData?.commits?.length?.toLocaleString() ?? '—'} sublabel="" />
      </div>

      {/* Navigation Tabs */}
      <DevTabs
        tabs={['Overview', 'Code', 'Issues', 'Pull Requests', 'Analytics']}
        active={tab}
        onChange={setTab}
        className="mb-5"
        counts={{
          Issues: repoInfo?.open_issues_count ?? 0,
          'Pull Requests': repoInfo?.open_issues_count ? '—' : 0, // PR count not in basic repo API
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
                {languagesArray.length > 0 && (
                  <span className="text-xs text-[#8b949e] font-mono">
                    {totalBytes.toLocaleString()} bytes
                  </span>
                )}
              </div>
              {languagesWithPct.length > 0 ? (
                <LanguageBar
                  langs={languagesWithPct}
                />
              ) : (
                <p className="text-xs text-[#8b949e]">No language data available</p>
              )}
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
                  {repoInfo?.description ?? 'No description available'}
                </p>
                {repoInfo?.homepage && (
                  <div className="flex items-center gap-2">
                    <span>🏠</span>
                    <a href={repoInfo.homepage} target="_blank" rel="noreferrer" className="text-[#2f81f7] hover:underline font-mono">
                      {repoInfo.homepage}
                    </a>
                  </div>
                )}
                {repoInfo?.html_url && (
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <a href={repoInfo.html_url} target="_blank" rel="noreferrer" className="text-[#2f81f7] hover:underline font-mono">
                      {repoInfo.html_url}
                    </a>
                  </div>
                )}
                {repoInfo?.license?.name && (
                  <div className="flex items-center gap-2">
                    <span>⚖️</span>
                    <span>{repoInfo.license.name}</span>
                  </div>
                )}
                {repoInfo?.default_branch && (
                  <div className="flex items-center gap-2">
                    <span>🌿</span>
                    <span>Default branch: {repoInfo.default_branch}</span>
                  </div>
                )}
                {repoInfo?.created_at && (
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Created {new Date(repoInfo.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                {repoInfo?.updated_at && (
                  <div className="flex items-center gap-2">
                    <span>🔄</span>
                    <span>Updated {new Date(repoInfo.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
                {repoInfo?.pushed_at && (
                  <div className="flex items-center gap-2">
                    <span>📤</span>
                    <span>Last push {new Date(repoInfo.pushed_at).toLocaleDateString()}</span>
                  </div>
                )}
                {repoInfo?.size && (
                  <div className="flex items-center gap-2">
                    <span>💾</span>
                    <span>Size: {(repoInfo.size / 1024).toFixed(1)} MB</span>
                  </div>
                )}
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
