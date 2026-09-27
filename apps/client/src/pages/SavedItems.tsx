import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Repository, Developer } from '../types';
import { getFullRepository, getUser } from '../services/githubApi';
import {
  Avatar,
  StarCount,
  ForkCount,
  LanguageDot,
  SaveButton,
  DevTabs,
  DevSearch,
  EmptyState,
  SidebarSection,
} from '../components/DevComponents';
import { useDevHubStore } from '../store/useDevHubStore';

export function SavedItemsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('Repositories');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedRepoList, setSavedRepoList] = useState<Repository[]>([]);
  const [savedDevList, setSavedDevList] = useState<Developer[]>([]);

  const {
    savedRepos,
    toggleSaveRepo,
    savedDevs,
    toggleSaveDev,
    followingDevs,
    toggleFollowDev,
    recentlyViewed,
    addRecent,
  } = useDevHubStore();

  // Load repo and developer details for saved items with Promise.allSettled error resilience
  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const repoResults = await Promise.allSettled(
          savedRepos.map(async (fullName) => {
            const [owner, repo] = fullName.split('/');
            if (!owner || !repo) return null;
            const data = await getFullRepository(owner, repo);
            const r = data.repo;
            if (!r) return null;
            const repoObj: Repository = {
              id: String(r.id),
              name: r.name,
              owner: r.owner?.login || owner,
              fullName: r.full_name || fullName,
              description: r.description || '',
              stars: r.stargazers_count ?? 0,
              forks: r.forks_count ?? 0,
              watchers: r.watchers_count ?? 0,
              openIssues: r.open_issues_count ?? 0,
              language: r.language || '',
              topics: r.topics || [],
              updatedAt: r.updated_at || '',
            };
            return repoObj;
          })
        );

        if (!isCancelled) {
          const repos = repoResults
            .filter((res): res is PromiseFulfilledResult<Repository | null> => res.status === 'fulfilled' && res.value !== null)
            .map(res => res.value as Repository);
          setSavedRepoList(repos);
        }

        const devResults = await Promise.allSettled(
          savedDevs.map(async (username) => {
            if (!username) return null;
            const u = await getUser(username);
            if (!u) return null;
            const devObj: Developer = {
              id: String(u.id),
              name: u.name || u.login || username,
              username: u.login || username,
              bio: u.bio || '',
              avatarUrl: u.avatar_url,
              reposCount: u.public_repos ?? 0,
              followers: u.followers ?? 0,
              following: u.following ?? 0,
              primaryLanguage: '',
              location: u.location || '',
              company: u.company || '',
              blog: u.blog || '',
            };
            return devObj;
          })
        );

        if (!isCancelled) {
          const devs = devResults
            .filter((res): res is PromiseFulfilledResult<Developer | null> => res.status === 'fulfilled' && res.value !== null)
            .map(res => res.value as Developer);
          setSavedDevList(devs);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      isCancelled = true;
    };
  }, [savedRepos, savedDevs]);

  const filteredRepos = useMemo(() => {
    if (!query.trim()) return savedRepoList;
    const q = query.toLowerCase();
    return savedRepoList.filter(
      r => r.name.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    );
  }, [savedRepoList, query]);

  const filteredDevs = useMemo(() => {
    if (!query.trim()) return savedDevList;
    const q = query.toLowerCase();
    return savedDevList.filter(
      d => d.username.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.bio.toLowerCase().includes(q)
    );
  }, [savedDevList, query]);

  const handleRepoClick = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    const [owner, repo] = fullName.split('/');
    navigate(`/repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
  };

  const handleDevClick = (username: string) => {
    addRecent({ type: 'dev', id: username, name: username });
    navigate(`/developer?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#f0f6fc]">
            Saved Bookmarks
          </h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage your curated repositories and tracked developers
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 rounded border border-[#30363d] bg-[#161b22] text-[#2f81f7]">
          {savedRepos.length + savedDevs.length} Saved
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content Pane */}
        <div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
            <DevSearch
              placeholder="Filter saved items..."
              value={query}
              onChange={setQuery}
              className="flex-1 max-w-sm"
            />
            <DevTabs
              tabs={['Repositories', 'Developers']}
              active={tab}
              onChange={setTab}
              counts={{
                Repositories: filteredRepos.length,
                Developers: filteredDevs.length,
              }}
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="dev-card p-4 animate-pulse flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded bg-[#21262d]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-[#21262d] rounded" />
                    <div className="h-3 w-2/3 bg-[#21262d] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Repositories Tab */}
          {!isLoading && tab === 'Repositories' && (
            <div className="space-y-3">
              {filteredRepos.length === 0 ? (
                <EmptyState
                  title="No saved repositories found"
                  subtitle={query ? 'Try a different search filter' : 'Explore repositories and click the bookmark button to save them.'}
                  action="Explore Repositories"
                  onAction={() => navigate('/explore')}
                />
              ) : (
                filteredRepos.map(repo => (
                  <div
                    key={repo.id}
                    className="dev-card dev-card-interactive p-4 flex items-start gap-3.5 cursor-pointer"
                    onClick={() => handleRepoClick(`${repo.owner}/${repo.name}`)}
                  >
                    <Avatar name={repo.name} size={36} rounded={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] font-mono">
                            {`${repo.owner}/${repo.name}`}
                          </span>
                          <p className="text-xs text-[#8b949e] mt-1 mb-2">
                            {repo.description}
                          </p>
                        </div>
                        <SaveButton
                          saved={true}
                          onToggle={() => toggleSaveRepo(`${repo.owner}/${repo.name}`)}
                        />
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <StarCount count={repo.stars} />
                        <ForkCount count={repo.forks} />
                        {repo.language && <LanguageDot lang={repo.language} />}
                        <span className="text-[11px] text-[#6e7681] font-mono ml-auto">
                          Saved to favorites
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Developers Tab */}
          {!isLoading && tab === 'Developers' && (
            <div className="space-y-3">
              {filteredDevs.length === 0 ? (
                <EmptyState
                  title="No saved developers found"
                  subtitle={query ? 'Try a different search filter' : 'Discover top open source engineers and save them to your watchlist.'}
                  action="Discover Developers"
                  onAction={() => navigate('/explore')}
                />
              ) : (
                filteredDevs.map(dev => {
                  const isFollowing = followingDevs.includes(dev.username);
                  return (
                    <div
                      key={dev.id}
                      className="dev-card dev-card-interactive p-4 flex items-center justify-between cursor-pointer"
                      onClick={() => handleDevClick(dev.username)}
                    >
                      <div className="flex items-center gap-3.5">
                        <Avatar name={dev.name} src={dev.avatarUrl} size={42} rounded={true} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#f0f6fc]">
                              {dev.name}
                            </span>
                            <span className="text-xs font-mono text-[#8b949e]">
                              @{dev.username}
                            </span>
                          </div>
                          {dev.bio && (
                            <p className="text-xs text-[#8b949e] mt-0.5 line-clamp-1">
                              {dev.bio}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-[11px] font-mono text-[#6e7681] mt-1">
                            <span>{dev.followers} followers</span>
                            <span>{dev.reposCount} repos</span>
                            {dev.primaryLanguage && <LanguageDot lang={dev.primaryLanguage} />}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            toggleFollowDev(dev.username);
                          }}
                          className={`dev-btn text-xs py-1 px-3 ${
                            isFollowing ? 'dev-btn-secondary' : 'dev-btn-primary'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <SaveButton
                          saved={true}
                          onToggle={() => toggleSaveDev(dev.username)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar: Recently Viewed */}
        <div className="space-y-5">
          <SidebarSection title="Recently Viewed">
            {recentlyViewed.length === 0 ? (
              <p className="text-xs text-[#8b949e]">No recently viewed items</p>
            ) : (
              <div className="space-y-2">
                {recentlyViewed.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.type === 'repo') {
                        const [owner, repo] = item.name.split('/');
                        navigate(`/repository?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);
                      } else {
                        navigate(`/developer?username=${encodeURIComponent(item.name)}`);
                      }
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[#21262d] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar name={item.name} size={22} rounded={item.type === 'dev'} />
                      <span className="text-xs font-mono text-[#c9d1d9] group-hover:text-[#2f81f7] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6e7681] flex-shrink-0">
                      {item.time}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}
