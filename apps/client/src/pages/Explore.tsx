import React, { useState, useMemo } from 'react';
import { Page } from '../types';
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
} from '../components/DevComponents';
import { TRENDING_REPOSITORIES, TOP_DEVELOPERS } from '../services/githubService';
import { useDevHubStore } from '../store/useDevHubStore';

export function ExplorePage({ onNav }: { onNav: (page: Page) => void }) {
  const [tab, setTab] = useState('Repositories');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState('Stars');
  const [filterOpen, setFilterOpen] = useState(true);

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

  const filteredRepos = useMemo(() => {
    return TRENDING_REPOSITORIES.filter(repo => {
      if (query) {
        const q = query.toLowerCase();
        const matchName = repo.fullName.toLowerCase().includes(q);
        const matchDesc = repo.description.toLowerCase().includes(q);
        const matchTopic = repo.topics.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchTopic) return false;
      }
      if (filters.lang && repo.language.toLowerCase() !== filters.lang.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [query, filters]);

  const filteredDevs = useMemo(() => {
    return TOP_DEVELOPERS.filter(dev => {
      if (query) {
        const q = query.toLowerCase();
        const matchName = dev.name.toLowerCase().includes(q);
        const matchHandle = dev.username.toLowerCase().includes(q);
        const matchBio = dev.bio.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchBio) return false;
      }
      if (filters.lang && dev.primaryLanguage.toLowerCase() !== filters.lang.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [query, filters]);

  const handleSelectRepo = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    onNav('repo');
  };

  const handleSelectDev = (username: string) => {
    addRecent({ type: 'dev', id: username, name: username });
    onNav('profile');
  };

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
          value={query}
          onChange={setQuery}
          size="lg"
          className="max-w-2xl"
        />
      </div>

      {/* Tabs and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <DevTabs
          tabs={['Repositories', 'Developers']}
          active={tab}
          onChange={t => {
            setTab(t);
            setPage(1);
          }}
          counts={{
            Repositories: filteredRepos.length * 482,
            Developers: filteredDevs.length * 214,
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
            onChange={setSort}
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
                  onClick={() => setFilters({})}
                  className="text-xs text-[#2f81f7] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
            <FilterPanel
              filters={tab === 'Repositories' ? repoFilters : devFilters}
              values={filters}
              onChange={(k, v) =>
                setFilters(prev => ({
                  ...prev,
                  [k]: prev[k] === v ? '' : v,
                }))
              }
            />
          </div>
        )}

        {/* Results Stream */}
        <div className="min-w-0">
          <div className="text-xs text-[#8b949e] mb-3 font-mono flex items-center justify-between">
            <span>
              Showing {tab === 'Repositories' ? filteredRepos.length : filteredDevs.length} curated results
              {query && ` for "${query}"`}
            </span>
            <span className="text-[11px] text-[#6e7681]">Page {page} of 8</span>
          </div>

          {tab === 'Repositories' ? (
            <div className="space-y-3">
              {filteredRepos.map(repo => {
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
                        <span className="text-[11px] text-[#6e7681] font-mono">
                          Updated {repo.updatedAt}
                        </span>
                      </div>
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {filteredDevs.map(dev => {
                const isSaved = savedDevs.includes(dev.username);
                const isFollowing = followingDevs.includes(dev.username);
                return (
                  <div
                    key={dev.id}
                    className="dev-card dev-card-interactive p-4 flex gap-3.5 cursor-pointer"
                    onClick={() => handleSelectDev(dev.username)}
                  >
                    <Avatar name={dev.name} size={48} rounded={true} />
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
                      <p className="text-xs text-[#8b949e] mt-1.5 mb-2 line-clamp-2">
                        {dev.bio}
                      </p>
                      <div className="flex gap-3 text-xs font-mono text-[#8b949e] mb-2.5">
                        <span>{dev.followers} followers</span>
                        <span>{dev.reposCount} repos</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-[#30363d]/50">
                        <LanguageDot lang={dev.primaryLanguage} />
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
          )}

          <DevPagination current={page} total={8} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
