import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  SkeletonCard,
  SkeletonGrid,
  SkeletonText,
  EmptyState,
} from '../components/DevComponents';
import { getDashboardData } from '../services/githubApi';
import { useDevHubStore } from '../store/useDevHubStore';
import type { DashboardData, DashboardRepository, DashboardLanguage, DashboardContributions, DashboardOrganization, DashboardActivityItem, DashboardGist, DashboardStarredRepo } from '../types';

export function DashboardPage({ onNav }: { onNav?: (page: Page) => void }) {
  const [tab, setTab] = useState('Overview');
  const [alertDismissed, setAlertDismissed] = useState(false);
  const navigate = useNavigate();
  const fallbackNav = (page: Page) => {
    navigate(page === 'home' ? '/' : page.startsWith('/') ? page : `/${page}`);
  };
  const { savedRepos, savedDevs } = useDevHubStore();

  const { data: dashboardData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Get username for display
  const username = dashboardData?.user?.login ?? '';

  // Build contribution grid data
  const contributionWeeks = dashboardData?.contributions?.weeks ?? [];

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter" role="status" aria-label="Loading dashboard">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#30363d]">
            <div className="flex items-center gap-3.5">
              <SkeletonCard width={44} height={44} rounded />
              <div className="space-y-1.5">
                <SkeletonText width={200} />
                <SkeletonText width={150} />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <SkeletonCard width={100} height={32} />
              <SkeletonCard width={120} height={32} />
            </div>
          </div>

          {/* Metrics skeleton */}
          <SkeletonGrid cols={4} rows={1} height={80} gap={14} className="mb-6" />

          {/* Main content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-5">
              <SkeletonCard height={300} />
              <SkeletonCard height={350} />
            </div>
            <div className="space-y-5">
              <SkeletonCard height={300} />
              <SkeletonCard height={200} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard';
    const isAuthError = errorMessage.includes('Not authenticated') || errorMessage.includes('401');
    const isTokenError = errorMessage.includes('GitHub account not connected') || errorMessage.includes('400');

    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <EmptyState
          title={isAuthError ? 'Sign in required' : isTokenError ? 'Connect your GitHub account' : 'Unable to load dashboard'}
          subtitle={isAuthError
            ? 'Please sign in to view your personalized dashboard.'
            : isTokenError
            ? 'Your GitHub account is not connected. Go to settings to link your account.'
            : 'We couldn\'t load your dashboard data. Please try again.'}
          action={isAuthError ? 'Sign In' : isTokenError ? 'Connect GitHub' : 'Retry'}
          onAction={isAuthError
            ? () => navigate('/login', { replace: true })
            : isTokenError
            ? () => navigate('/settings', { replace: true })
            : handleRetry}
        />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <EmptyState
          title="No data available"
          subtitle="Your dashboard is empty. Try connecting your GitHub account."
          action="Retry"
          onAction={handleRetry}
        />
      </div>
    );
  }

  const { user, stats, languages, contributions, repositories, recentActivity, gists, starredRepos, following, organizations } = dashboardData;

  // Format number for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return String(num);
  };

  // Get top languages for display
  const topLanguages = languages.slice(0, 6);

  // Build contribution grid from API data
  const contributionGridData = {
    total: contributions.total,
    weeks: contributionWeeks.map((week: { days: Array<{ date: string; count: number; color: string }> }) => ({
      days: week.days.map((day: { date: string; count: number; color: string }) => ({
        date: day.date,
        count: day.count,
        color: day.color,
      })),
    })),
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3.5">
          <Avatar name={user.name ?? user.login} src={user.avatarUrl} size={44} rounded={true} />
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
              Welcome back, <span className="text-[#f0f6fc]">@{username}</span> · Synchronized with GitHub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => (onNav ?? fallbackNav)('/developer')}
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
        tabs={['Overview', 'Repositories', 'Activity', 'Gists', 'Starred', 'Analytics']}
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
              value={formatNumber(stats.stars)}
              sublabel={`Across ${stats.repos} repositories`}
              trend="up"
            />
            <MetricCard
              label="Annual Contributions"
              value={formatNumber(stats.contributions)}
              sublabel="past 365 days"
              trend={stats.contributions > 0 ? 'up' : 'flat'}
            />
            <MetricCard
              label="Followers"
              value={formatNumber(stats.followers)}
              sublabel={`Following ${formatNumber(stats.following)}`}
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
                    {formatNumber(contributions.total)} contributions in {new Date().getFullYear()}
                  </span>
                </div>
                {contributions.total > 0 ? (
                  <ContributionGrid data={contributionGridData} />
                ) : (
                  <div className="py-12 text-center">
                    <div className="text-3xl mb-2">📅</div>
                    <p className="text-sm text-[#8b949e]">No contributions yet this year</p>
                    <p className="text-xs text-[#6e7681] mt-1">Start coding to fill your heatmap!</p>
                  </div>
                )}
              </div>

              {/* Repositories Managed */}
              <div className="dev-card p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#30363d]">
                  <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                    My Repositories ({stats.repos})
                  </span>
                  <span className="text-xs text-[#2f81f7] hover:underline cursor-pointer">
                    View all →
                  </span>
                </div>

                {repositories.length > 0 ? (
                  <div className="space-y-2">
                    {repositories.slice(0, 10).map((repo: DashboardRepository) => (
                      <div
                        key={repo.id}
                        onClick={() => navigate(`/repository?owner=${encodeURIComponent(repo.owner ?? username)}&repo=${encodeURIComponent(repo.name)}`)}
                        className="flex items-center justify-between p-2.5 rounded-md hover:bg-[#21262d] transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <span className="font-semibold text-sm font-mono text-[#f0f6fc] group-hover:text-[#2f81f7] truncate">
                            {repo.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border flex-shrink-0 ${
                              repo.isPrivate
                                ? 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40'
                                : 'bg-[#21262d] text-[#8b949e] border-[#30363d]'
                            }`}
                          >
                            {repo.isPrivate ? 'Private' : 'Public'}
                          </span>
                          {repo.language && <LanguageDot lang={repo.language} />}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
                          <StarCount count={repo.stars} />
                          <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                    {repositories.length > 10 && (
                      <div className="text-center py-2 text-xs text-[#8b949e]">
                        +{repositories.length - 10} more repositories
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-sm text-[#8b949e]">No repositories yet</p>
                    <button className="dev-btn dev-btn-primary text-xs mt-2">
                      <span>+</span> Create your first repository
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Language Distribution */}
              <SidebarSection title="Top Languages">
                {languages.length > 0 ? (
                  <div className="space-y-3">
                    {topLanguages.map((lang: DashboardLanguage) => (
                      <div key={lang.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} />
                            <span className="font-mono text-[#f0f6fc]">{lang.name}</span>
                          </div>
                          <span className="text-[#8b949e] font-mono">{lang.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#8b949e]">No language data available</p>
                )}
              </SidebarSection>

              {/* Quick Stats */}
              <SidebarSection title="Quick Stats">
                <div className="space-y-2 text-xs text-[#8b949e]">
                  <div className="flex justify-between">
                    <span>Public Repos</span>
                    <span className="text-[#f0f6fc] font-mono">{stats.publicRepos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Repos</span>
                    <span className="text-[#f0f6fc] font-mono">{stats.privateRepos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Forks</span>
                    <span className="text-[#f0f6fc] font-mono">{formatNumber(stats.forks)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gists</span>
                    <span className="text-[#f0f6fc] font-mono">{stats.gists}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starred Repos</span>
                    <span className="text-[#f0f6fc] font-mono">{formatNumber(stats.starredRepos)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Repos Contributed To</span>
                    <span className="text-[#f0f6fc] font-mono">{stats.reposContributedTo}</span>
                  </div>
                </div>
              </SidebarSection>

              {/* Organizations */}
              {organizations.length > 0 && (
                <SidebarSection title="Organizations">
                  <div className="flex flex-wrap gap-2">
                    {organizations.slice(0, 6).map((org: DashboardOrganization) => (
                      <a
                        key={org.login}
                        href={org.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161b22] border border-[#30363d] hover:border-[#2f81f7] transition-colors"
                      >
                        <img src={org.avatarUrl} alt="" className="w-5 h-5 rounded" />
                        <span className="text-xs font-mono text-[#f0f6fc]">{org.login}</span>
                      </a>
                    ))}
                    {organizations.length > 6 && (
                      <span className="px-2 py-1 text-xs text-[#8b949e]">+{organizations.length - 6} more</span>
                    )}
                  </div>
                </SidebarSection>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'Repositories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">All Repositories</h2>
            <span className="text-xs text-[#8b949e] font-mono">{repositories.length} repositories</span>
          </div>
          {repositories.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo: DashboardRepository) => (
                <div
                  key={repo.id}
                  onClick={() => navigate(`/repository?owner=${encodeURIComponent(repo.owner ?? username)}&repo=${encodeURIComponent(repo.name)}`)}
                  className="dev-card p-4 hover:border-[#2f81f7] cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-mono font-semibold text-[#f0f6fc] group-hover:text-[#2f81f7] truncate">
                      {repo.name}
                    </h3>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono border flex-shrink-0 ${
                        repo.isPrivate
                          ? 'bg-[#d29922]/15 text-[#d29922] border-[#d29922]/40'
                          : 'bg-[#21262d] text-[#8b949e] border-[#30363d]'
                      }`}
                    >
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p className="text-xs text-[#8b949e] line-clamp-2 mb-3">
                    {repo.description ?? 'No description'}
                  </p>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8b949e]">
                    {repo.language && <LanguageDot lang={repo.language} />}
                    <StarCount count={repo.stars} />
                    <span>{formatNumber(repo.forks)} forks</span>
                    <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {repo.topics.slice(0, 4).map((topic: string) => (
                        <span key={topic} className="px-1.5 py-0.5 text-[10px] rounded bg-[#21262d] text-[#8b949e] border border-[#30363d]">
                          {topic}
                        </span>
                      ))}
                      {repo.topics.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#21262d] text-[#6e7681] border border-[#30363d]">
                          +{repo.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No repositories found"
              subtitle="You don't have any repositories yet. Create one to get started!"
              action="Create Repository"
              onAction={() => { /* TODO: navigate to create repo */ }}
            />
          )}
        </div>
      )}

      {tab === 'Activity' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#f0f6fc]">Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: DashboardActivityItem, index: number) => (
                <div
                  key={index}
                  className="dev-card p-3 flex items-start gap-3 hover:border-[#2f81f7] transition-colors"
                >
                  <div className="w-2 h-2 rounded-full mt-2 bg-[#2f81f7] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f6fc]">
                      <span className="font-mono text-[#2f81f7]">{activity.repo}</span>
                      {' '}
                      <span className="text-[#8b949e]">pushed to</span>
                      {' '}
                      <span className="font-mono">{activity.payload?.ref ?? 'default branch'}</span>
                    </p>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      {new Date(activity.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No recent activity"
              subtitle="Your recent GitHub activity will appear here."
            />
          )}
        </div>
      )}

      {tab === 'Gists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Gists</h2>
            <span className="text-xs text-[#8b949e] font-mono">{gists.length} gists</span>
          </div>
          {gists.length > 0 ? (
            <div className="space-y-2">
              {gists.map((gist: DashboardGist) => (
                <a
                  key={gist.id}
                  href={gist.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dev-card p-3 hover:border-[#2f81f7] transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-[#f0f6fc] truncate">
                      {gist.description ?? 'Untitled gist'}
                    </p>
                    <p className="text-xs text-[#8b949e] mt-0.5">
                      {gist.files.join(', ')} · {gist.public ? 'Public' : 'Secret'}
                      {' · Updated ' + new Date(gist.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <EmptyState title="No gists yet" subtitle="Create a gist on GitHub to see it here." />
          )}
        </div>
      )}

      {tab === 'Starred' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#f0f6fc]">Starred Repositories</h2>
            <span className="text-xs text-[#8b949e] font-mono">{starredRepos.length} starred</span>
          </div>
          {starredRepos.length > 0 ? (
            <div className="space-y-2">
              {starredRepos.slice(0, 20).map((repo: DashboardStarredRepo) => (
                <div
                  key={repo.id}
                  onClick={() => navigate(`/repository?owner=${encodeURIComponent(repo.fullName.split('/')[0])}&repo=${encodeURIComponent(repo.name)}`)}
                  className="dev-card p-3 hover:border-[#2f81f7] cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#161b22] border border-[#30363d] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#8b949e]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm text-[#f0f6fc] truncate">{repo.fullName}</p>
                      <p className="text-xs text-[#8b949e] truncate">{repo.description ?? 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8b949e] flex-shrink-0">
                    {repo.language && <LanguageDot lang={repo.language} />}
                    <StarCount count={repo.stars} />
                  </div>
                </div>
              ))}
              {starredRepos.length > 20 && (
                <div className="text-center py-2 text-xs text-[#8b949e]">
                  +{starredRepos.length - 20} more starred repositories
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No starred repositories" subtitle="Star repositories on GitHub to see them here." />
          )}
        </div>
      )}

      {tab === 'Analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Weekly Repository Views
            </span>
            <VectorChart height={160} type="area" label="views / day" />
            <p className="text-xs text-[#8b949e] mt-2">Traffic data requires GitHub API access</p>
          </div>
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Stargazers Growth
            </span>
            <VectorChart height={160} type="bar" label="new stars / week" />
            <p className="text-xs text-[#8b949e] mt-2">Growth data requires GitHub API access</p>
          </div>
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Language Distribution
            </span>
            <VectorChart height={160} type="pie" label="languages" />
            <p className="text-xs text-[#8b949e] mt-2">Based on your repositories</p>
          </div>
          <div className="dev-card p-4">
            <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider block mb-3">
              Contribution Streak
            </span>
            <VectorChart height={160} type="line" label="days" />
            <p className="text-xs text-[#8b949e] mt-2">Calculated from your contribution calendar</p>
          </div>
        </div>
      )}
    </div>
  );
}