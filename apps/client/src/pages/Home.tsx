import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  VectorChart,
  SaveButton,
  StarCount,
  ForkCount,
  LanguageDot,
  LanguageBar,
  RateLimitShield,
  DevSearch,
  SidebarSection,
} from '../components/DevComponents';
import { useDevHub } from '../hooks/useDevHub';
import { useDevHubStore } from '../store/useDevHubStore';

export function HomePage() {
  const navigate = useNavigate();
  const onNav = (page: string) => navigate(page);

  const {
    featuredRepo,
    repositories,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
  } = useDevHub();

  const { savedRepos, toggleSaveRepo, addRecent } = useDevHubStore();
  const [alertDismissed, setAlertDismissed] = useState(false);

  const handleRepoClick = (fullName: string) => {
    addRecent({ type: 'repo', id: fullName, name: fullName });
    onNav('/repository');
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      {/* Rate limit alert shield */}
      {!alertDismissed && (
        <div className="mb-5">
          <RateLimitShield onDismiss={() => setAlertDismissed(true)} />
        </div>
      )}

      {/* Hero Discovery Search */}
      <div className="dev-card bg-[#21262d] p-4 rounded-lg mb-6 border border-[#30363d] flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-[#2f81f7]/40 bg-[#2f81f7]/10 text-[#2f81f7] text-xs font-mono mb-1">
          <span>◈</span>
          <span>GitHub Discovery &amp; Analytics Engine</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#f0f6fc]">
          Discover GitHub Repositories &amp; Developers
        </h1>
        <p className="text-sm text-[#8b949e] max-w-lg">
          Explore ranked trending repositories, track real-time commit activity, and inspect comprehensive technical metrics.
        </p>
        <DevSearch
          placeholder="Search for repositories, developers, topics..."
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={() => onNav('explore')}
          size="lg"
          className="w-full max-w-xl mt-1"
        />
        <div className="flex gap-2 flex-wrap justify-center mt-1 items-center">
          <span className="text-xs text-[#6e7681]">Popular tags:</span>
          {['react', 'machine-learning', 'rust', 'nextjs', 'llm', 'systems'].map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSearchQuery(tag);
                onNav('explore');
              }}
              className="text-xs font-mono text-[#8b949e] hover:text-[#2f81f7] hover:underline transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`dev-chip flex-shrink-0 ${selectedCategory === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Feed + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Feed Column */}
        <div className="space-y-6">
          {/* Featured Repository Spotlight Card */}
          <div className="dev-card p-4 border border-[#30363d]">
            <h3 className="text-sm font-semibold text-[#f0f6fc] mb-2">Featured Repository</h3>

            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3.5 flex-1 min-w-0">
                <Avatar name={featuredRepo.name} size={46} rounded={false} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <button
                      onClick={() => handleRepoClick(featuredRepo.fullName)}
                      className="font-bold text-[#f0f6fc] text-base hover:text-[#2f81f7] hover:underline"
                    >
                      {featuredRepo.fullName}
                    </button>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#238636]/15 border border-[#238636] text-[#3fb950]">
                      Active Release
                    </span>
                  </div>

                  <p className="text-sm text-[#8b949e] mb-3 leading-relaxed">
                    {featuredRepo.description}
                  </p>

                  <div className="flex items-center gap-4 flex-wrap mb-3.5">
                    <StarCount count={featuredRepo.stars} />
                    <ForkCount count={featuredRepo.forks} />
                    <LanguageDot lang={featuredRepo.language} />
                    <span className="text-xs text-[#6e7681] font-mono">
                      Updated {featuredRepo.updatedAt}
                    </span>
                  </div>

                  {featuredRepo.languages && (
                    <div className="pt-2 border-t border-[#30363d]/50">
                      <LanguageBar langs={featuredRepo.languages} />
                    </div>
                  )}
                </div>
              </div>

              <SaveButton
                saved={savedRepos.includes(featuredRepo.fullName)}
                onToggle={() => toggleSaveRepo(featuredRepo.fullName)}
              />
            </div>
          </div>

          {/* Trending Repositories Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base text-[#f0f6fc]">Trending Repositories</h2>
                <span className="text-xs font-mono text-[#6e7681]">
                  ({repositories.length} repositories)
                </span>
              </div>
              <button
                onClick={() => onNav('explore')}
                className="text-xs text-[#2f81f7] hover:underline font-medium"
              >
                View all in Explore →
              </button>
            </div>

            <div className="space-y-3">
              {repositories.map((repo, i) => {
                const isSaved = savedRepos.includes(repo.fullName);
                return (
                  <div
                    key={repo.id}
                    className="dev-card dev-card-interactive p-4 flex items-start gap-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2f81f7]" role="button" tabIndex={0} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRepoClick(repo.fullName); }}
                    onClick={() => handleRepoClick(repo.fullName)}
                  >
                    <Avatar name={repo.name} size={34} rounded={false} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-sm text-[#f0f6fc] hover:text-[#2f81f7] leading-tight">
                          {repo.fullName}
                        </span>
                        <SaveButton
                          saved={isSaved}
                          onToggle={() => toggleSaveRepo(repo.fullName)}
                        />
                      </div>
                      <p className="text-xs text-[#8b949e] mt-1 mb-2.5 line-clamp-2">
                        {repo.description}
                      </p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <StarCount count={repo.stars} />
                        <ForkCount count={repo.forks} />
                        <LanguageDot lang={repo.language} />
                        <span className="text-[11px] text-[#6e7681] font-mono">
                          {repo.updatedAt}
                        </span>
                        <div className="flex gap-1.5 ml-auto">
                          {repo.topics.slice(0, 2).map(t => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-5">
          {/* Weekly Commit Activity Graph */}
          <SidebarSection title="Commit Velocity">
            <div className="space-y-2">
              <VectorChart height={84} type="area" label="commits / week" />
              <div className="flex justify-between text-[11px] font-mono text-[#6e7681] pt-1">
                <span>Total: 1,482 commits</span>
                <span className="text-[#3fb950] font-semibold">↑ 18.4% vs last mo</span>
              </div>
            </div>
          </SidebarSection>

          {/* Top Ecosystem Languages */}
          <SidebarSection title="Language Share">
            <div className="space-y-2.5">
              {[
                { lang: 'TypeScript', pct: 38, color: '#3178c6' },
                { lang: 'Python', pct: 27, color: '#3572A5' },
                { lang: 'Rust', pct: 15, color: '#dea584' },
                { lang: 'Go', pct: 11, color: '#00ADD8' },
                { lang: 'Other', pct: 9, color: '#8b949e' }
              ].map(item => (
                <div key={item.lang} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-[#c9d1d9] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                      {item.lang}
                    </span>
                    <span className="text-[#8b949e]">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#21262d] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          {/* Quick Actions Card */}
          <SidebarSection title="Quick Actions">
            <div className="space-y-1">
              {[
                { label: 'Import from GitHub', icon: '↓', target: '/login' },
                  { label: 'User Dashboard', icon: '◈', target: '/dashboard' },
                  { label: 'Saved Bookmarks', icon: '★', target: '/saved' },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => onNav(action.target)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm text-[#8b949e] hover:bg-[#21262d] hover:text-[#f0f6fc] text-left transition-colors font-medium"
                >
                  <span className="w-5 text-center font-mono text-[#2f81f7]">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          {/* Recently Viewed */}
          <SidebarSection title="Recently Viewed">
            <div className="space-y-1.5">
              {['facebook/react', 'golang/go', 'denoland/deno'].map(repoName => (
                <button
                  key={repoName}
                  onClick={() => handleRepoClick(repoName)}
                  className="flex items-center gap-2.5 w-full hover:bg-[#21262d] rounded-md px-2 py-1.5 text-left transition-colors group"
                >
                  <Avatar name={repoName} size={22} rounded={false} />
                  <span className="text-xs text-[#8b949e] group-hover:text-[#2f81f7] font-mono truncate">
                    {repoName}
                  </span>
                </button>
              ))}
            </div>
          </SidebarSection>
        </div>
      </div>
    </div>
  );
}
