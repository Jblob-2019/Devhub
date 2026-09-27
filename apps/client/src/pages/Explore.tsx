import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repository, Developer } from '../types';
import {
  Avatar,
  StarCount,
  ForkCount,
  LanguageDot,
  SaveButton,
  DevTabs,
  DevSearch,
  FilterPanel,
  SortBar,
  DevPagination,
  EmptyState,
} from '../components/DevComponents';
import { searchRepositories, searchUsers } from '../services/githubApi';
import { useDevHubStore } from '../store/useDevHubStore';

export function ExplorePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'Repositories' | 'Developers'>('Repositories');
  const [searchText, setSearchText] = useState('');
  const [sort, setSort] = useState('Stars');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(true);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [repoResults, setRepoResults] = useState<Repository[]>([]);
  const [devResults, setDevResults] = useState<Developer[]>([]);
  const [totalRepoCount, setTotalRepoCount] = useState(0);
  const [totalDevCount, setTotalDevCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    savedRepos,
    toggleSaveRepo,
    savedDevs,
    toggleSaveDev,
    followingDevs,
    toggleFollowDev,
    addRecent,
  } = useDevHubStore();

  const repoFilters = [
    { label: 'Language', key: 'lang', options: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go', 'C', 'C++'] },
    { label: 'Stars', key: 'stars', options: ['< 10k', '10k–50k', '50k–100k', '100k+'] },
    { label: 'Updated', key: 'updated', options: ['Today', 'This week', 'This month', 'This year'] },
    { label: 'License', key: 'license', options: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD'] },
  ];

  const devFilters = [
    { label: 'Language', key: 'lang', options: ['C', 'TypeScript', 'JavaScript', 'Python', 'Go', 'Rust'] },
    { label: 'Followers', key: 'followers', options: ['< 10k', '10k–50k', '50k–100k', '100k+'] },
    { label: 'Repos', key: 'repos', options: ['< 20', '20–50', '50–200', '200+'] },
  ];

  // Reset page to 1 when search text, filters, tab, or sort changes
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setPage(1);
  };

  const handleTabChange = (newTab: string) => {
    setTab(newTab as 'Repositories' | 'Developers');
    setSort(newTab === 'Repositories' ? 'Stars' : 'Followers');
    setFilters({});
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  const handleFilterChange = (key: string, val: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key] === val ? '' : val,
    }));
    setPage(1);
  };

  const buildQuery = useCallback((): string => {
    const trimmed = searchText.trim();

    if (tab === 'Repositories') {
      let q = trimmed || 'stars:>0';
      if (filters.lang) {
        q += ` language:${filters.lang}`;
      }
      if (filters.stars) {
        switch (filters.stars) {
          case '< 10k': q += ' stars:<10000'; break;
          case '10k–50k': q += ' stars:10000..50000'; break;
          case '50k–100k': q += ' stars:50000..100000'; break;
          case '100k+': q += ' stars:>100000'; break;
        }
      }
      if (filters.updated) {
        const now = Date.now();
        let days = 1;
        if (filters.updated === 'This week') days = 7;
        else if (filters.updated === 'This month') days = 30;
        else if (filters.updated === 'This year') days = 365;
        const dateStr = new Date(now - days * 86400000).toISOString().split('T')[0];
        q += ` pushed:>=${dateStr}`;
      }
      if (filters.license) {
        q += ` license:${filters.license.toLowerCase()}`;
      }
      return q;
    } else {
      let q = trimmed || 'followers:>0';
      if (filters.lang) {
        q += ` language:${filters.lang}`;
      }
      if (filters.followers) {
        switch (filters.followers) {
          case '< 10k': q += ' followers:<10000'; break;
          case '10k–50k': q += ' followers:10000..50000'; break;
          case '50k–100k': q += ' followers:50000..100000'; break;
          case '100k+': q += ' followers:>100000'; break;
        }
      }
      if (filters.repos) {
        switch (filters.repos) {
          case '< 20': q += ' repos:<20'; break;
          case '20–50': q += ' repos:20..50'; break;
          case '50–200': q += ' repos:50..200'; break;
          case '200+': q += ' repos:>200'; break;
        }
      }
      return q;
    }
  }, [tab, searchText, filters]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const query = buildQuery();

    try {
      if (tab === 'Repositories') {
        let sortParam: string | undefined;
        switch (sort) {
          case 'Stars': sortParam = 'stars'; break;
          case 'Forks': sortParam = 'forks'; break;
          case 'Updated': sortParam = 'updated'; break;
          default: sortParam = undefined;
        }

        const res = await searchRepositories(query, page, 20, sortParam);
        setTotalRepoCount(res.totalCount);

        const mapped: Repository[] = res.items.map((r: {
          id: number;
          name: string;
          owner?: { login: string };
          full_name: string;
          description?: string | null;
          stargazers_count: number;
          forks_count: number;
          watchers_count?: number;
          open_issues_count?: number;
          language?: string | null;
          topics?: string[];
          updated_at: string;
        }) => ({
          id: String(r.id),
          name: r.name,
          owner: r.owner?.login ?? '',
          fullName: r.full_name,
          description: r.description ?? '',
          stars: r.stargazers_count,
          forks: r.forks_count,
          watchers: r.watchers_count,
          openIssues: r.open_issues_count,
          language: r.language ?? 'Unknown',
          topics: r.topics ?? [],
          updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleDateString() : '',
          languages: [],
        }));
        setRepoResults(mapped);
      } else {
        let sortParam: string | undefined;
        switch (sort) {
          case 'Followers': sortParam = 'followers'; break;
          case 'Repos': sortParam = 'repositories'; break;
          default: sortParam = undefined;
        }

        const res = await searchUsers(query, page, 20, sortParam);
        setTotalDevCount(res.totalCount);

        const mapped: Developer[] = res.items.map((u: {
          id: number;
          login: string;
          name?: string | null;
          bio?: string | null;
          avatar_url?: string;
          public_repos?: number;
          followers?: number;
          following?: number;
          language?: string | null;
        }) => ({
          id: String(u.id),
          name: u.name || u.login,
          username: u.login,
          bio: u.bio ?? '',
          avatarUrl: u.avatar_url,
          reposCount: u.public_repos ?? 0,
          followers: u.followers ?? 0,
          following: u.following ?? 0,
          primaryLanguage: u.language ?? 'Unknown',
        }));
        setDevResults(mapped);
      }
    } catch (e: unknown) {
      console.error('Explore fetch error:', e);
      const msg = e instanceof Error ? e.message : 'Failed to search';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [tab, sort, page, buildQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectRepo = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    const [owner, repo] = fullName.split('/');
    navigate(`/repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
  };

  const handleSelectDev = (username: string) => {
    addRecent({ type: 'dev', id: username, name: username });
    navigate(`/developer?username=${encodeURIComponent(username)}`);
  };

  const activeTotalCount = tab === 'Repositories' ? totalRepoCount : totalDevCount;
  const totalPages = Math.max(1, Math.min(Math.ceil(activeTotalCount / 20), 50));

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Search Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
            Explore Ecosystem
          </h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-[#30363d] bg-[#161b22] text-[#8b949e]">
            Discovery Search
          </span>
        </div>
        <DevSearch
          placeholder={
            tab === 'Repositories'
              ? 'Search repositories by name, topic, or description...'
              : 'Search developers by username, real name, or tech stack...'
          }
          value={searchText}
          onChange={handleSearchChange}
          size="lg"
          className="max-w-2xl"
        />
      </div>

      {/* Tabs and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <DevTabs
          tabs={['Repositories', 'Developers']}
          active={tab}
          onChange={handleTabChange}
          counts={{
            Repositories: totalRepoCount,
            Developers: totalDevCount,
          }}
        />

        <div className="flex items-center gap-3">
          <SortBar
            options={
              tab === 'Repositories'
                ? ['Stars', 'Forks', 'Updated', 'Relevance']
                : ['Followers', 'Repos', 'Relevance']
            }
            value={sort}
            onChange={handleSortChange}
          />
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="dev-btn dev-btn-secondary text-xs gap-1.5"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M2 4h12M5 8h6M7 12h2" strokeLinecap="round" />
            </svg>
            <span>Filters</span>
            <span className="text-[10px] font-mono opacity-70">{filterOpen ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Filter sidebar + Results */}
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-6">
        {/* Filter Sidebar */}
        {filterOpen && (
          <div className="dev-card p-4 h-fit">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#30363d]">
              <span className="text-xs font-semibold text-[#f0f6fc] uppercase tracking-wider">
                Active Filters
              </span>
              {Object.keys(filters).length > 0 && (
                <button
                  onClick={() => { setFilters({}); setPage(1); }}
                  className="text-xs text-[#2f81f7] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel
              filters={tab === 'Repositories' ? repoFilters : devFilters}
              values={filters}
              onChange={handleFilterChange}
            />
          </div>
        )}

        {/* Results Stream */}
        <div className="min-w-0">
          <div className="text-xs text-[#8b949e] mb-3 font-mono flex items-center justify-between">
            <span>
              Showing {tab === 'Repositories' ? repoResults.length : devResults.length} of {activeTotalCount.toLocaleString()} results
              {searchText && ` for "${searchText}"`}
            </span>
            <span className="text-[11px] text-[#6e7681]">Page {page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-[#2f81f7] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#8b949e] font-mono">Searching GitHub...</p>
            </div>
          ) : error ? (
            <div className="py-12">
              <EmptyState
                title="Search Error"
                subtitle={error}
                action="Retry Search"
                onAction={fetchData}
              />
            </div>
          ) : tab === 'Repositories' ? (
            repoResults.length === 0 ? (
              <EmptyState
                title="No repositories found"
                subtitle="Try adjusting your search terms or clearing some filters."
                action={Object.keys(filters).length > 0 ? "Clear Filters" : undefined}
                onAction={Object.keys(filters).length > 0 ? () => { setFilters({}); setPage(1); } : undefined}
              />
            ) : (
              <div className="space-y-3">
                {repoResults.map(repo => {
                  const isSaved = savedRepos.includes(repo.fullName);
                  return (
                    <div
                      key={repo.id}
                      className="dev-card dev-card-interactive p-4 flex items-start gap-3.5 cursor-pointer"
                      onClick={() => handleSelectRepo(repo.fullName)}
                    >
                      <Avatar name={repo.name} size={38} rounded={false} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] transition-colors">
                              {repo.fullName}
                            </span>
                            <p className="text-xs text-[#8b949e] mt-1 mb-2.5 line-clamp-2">
                              {repo.description}
                            </p>
                          </div>
                          <SaveButton
                            saved={isSaved}
                            onToggle={() => toggleSaveRepo(repo.fullName)}
                          />
                        </div>
                        <div className="flex items-center gap-4 flex-wrap mb-2.5">
                          <StarCount count={repo.stars} />
                          <ForkCount count={repo.forks} />
                          <LanguageDot lang={repo.language} />
                          {repo.updatedAt && (
                            <span className="text-[11px] text-[#6e7681] font-mono">
                              Updated {repo.updatedAt}
                            </span>
                          )}
                        </div>
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {repo.topics.map(t => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            devResults.length === 0 ? (
              <EmptyState
                title="No developers found"
                subtitle="Try searching with a different name or technology."
                action={Object.keys(filters).length > 0 ? "Clear Filters" : undefined}
                onAction={Object.keys(filters).length > 0 ? () => { setFilters({}); setPage(1); } : undefined}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
                {devResults.map(dev => {
                  const isSaved = savedDevs.includes(dev.username);
                  const isFollowing = followingDevs.includes(dev.username);
                  return (
                    <div
                      key={dev.id}
                      className="dev-card dev-card-interactive p-4 flex gap-3.5 cursor-pointer"
                      onClick={() => handleSelectDev(dev.username)}
                    >
                      <Avatar name={dev.name} src={dev.avatarUrl} size={48} rounded={true} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-sm text-[#f0f6fc] hover:text-[#2f81f7]">
                              {dev.name}
                            </span>
                            <div className="text-xs font-mono text-[#8b949e]">
                              @{dev.username}
                            </div>
                          </div>
                          <SaveButton
                            saved={isSaved}
                            onToggle={() => toggleSaveDev(dev.username)}
                          />
                        </div>
                        {dev.bio && (
                          <p className="text-xs text-[#8b949e] mt-1.5 mb-2 line-clamp-2">
                            {dev.bio}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#30363d]/50">
                          <span className="text-xs text-[#58a6ff] hover:underline">
                            View Developer Profile →
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              toggleFollowDev(dev.username);
                            }}
                            className={`dev-btn text-xs py-0.5 px-2.5 ${
                              isFollowing ? 'dev-btn-secondary' : 'dev-btn-primary'
                            }`}
                          >
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {!loading && !error && activeTotalCount > 20 && (
            <div className="mt-6">
              <DevPagination current={page} total={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
