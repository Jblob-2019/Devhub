import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDeveloperProfile } from '../services/githubApi';
import { DeveloperProfileData } from '../types';
import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesApi';

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  HTML: '#e34c26',
  CSS: '#1572B6',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Other: '#8b949e',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    PushEvent: '📤',
    CreateEvent: '✨',
    IssuesEvent: '🐛',
    PullRequestEvent: '🔀',
    WatchEvent: '⭐',
    ForkEvent: '🍴',
    ReleaseEvent: '📦',
  };
  return icons[type] || '📝';
}

function getActivityText(item: DeveloperProfileData['activity'][0]): string {
  const { type, repo, payload } = item;
  switch (type) {
    case 'PushEvent':
      const commits = payload?.commits?.length || 0;
      return `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${repo}`;
    case 'CreateEvent':
      return `Created ${payload?.ref_type} ${payload?.ref} in ${repo}`;
    case 'IssuesEvent':
      return `${payload?.action?.charAt(0).toUpperCase() + payload?.action?.slice(1)} issue in ${repo}`;
    case 'PullRequestEvent':
      return `${payload?.action?.charAt(0).toUpperCase() + payload?.action?.slice(1)} PR in ${repo}`;
    case 'WatchEvent':
      return `Starred ${repo}`;
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'ReleaseEvent':
      return `Released ${payload?.release?.tag_name} in ${repo}`;
    default:
      return `${type} in ${repo}`;
  }
}

function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#21262d] rounded ${className}`} />
  );
}

function ProfileHeader({ user, isSaved, onSaveToggle }: {
  user: DeveloperProfileData['user'];
  isSaved: boolean;
  onSaveToggle: () => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
      <img
        src={user.avatarUrl}
        alt={user.login}
        className="w-24 h-24 rounded-full flex-shrink-0 border border-[#30363d]"
      />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <h1 className="text-2xl font-bold text-[#f0f6fc] truncate">
            {user.name || user.login}
          </h1>
          <span className="text-[#8b949e] text-lg">@{user.login}</span>
          <a
            href={user.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-[#58a6ff] hover:text-[#79c0ff] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </a>
        </div>
        {user.bio && (
          <p className="text-[#c9d1d9] mb-4 line-clamp-3">{user.bio}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-[#8b949e] mb-4">
          {user.location && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 1.5a5.5 5.5 0 110 11 5.5 5.5 0 010-11zM8 4a3 3 0 100 6 3 3 0 000-6z"/></svg>
              {user.location}
            </span>
          )}
          {user.company && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M13.975 2.264A.25.25 0 0013.694 2H2.306a.25.25 0 00-.281.264l-1.086 5.431a.25.25 0 00.142.446l4.205 4.206a.25.25 0 00.354 0l6.795-6.796 1.383 1.383a.25.25 0 00.354 0l1.444-1.444a.25.25 0 00-.142-.446l-1.382-1.383 3.193-3.194zM2.586 2.914l1.315 1.314L8 7.53l4.099-3.302 1.314-1.315-1.768-1.767-2.331 2.331L4.353 1.147 2.586 2.914z"/></svg>
              {user.company}
            </span>
          )}
          {user.blog && (
            <a href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#58a6ff] hover:text-[#79c0ff]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M4 4.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zM4 8a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7A.5.5 0 014 8zm0 3.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5z"/></svg>
              {user.blog}
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-[#8b949e]">
            <strong className="text-[#f0f6fc]">{formatNumber(user.followers)}</strong> followers
          </span>
          <span className="text-[#8b949e]">
            <strong className="text-[#f0f6fc]">{formatNumber(user.following)}</strong> following
          </span>
          <span className="text-[#8b949e]">
            <strong className="text-[#f0f6fc]">{formatNumber(user.publicRepos)}</strong> repos
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-[#8b949e]">Joined {formatDate(user.createdAt)}</span>
          <button
            onClick={onSaveToggle}
            className={`ml-auto px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              isSaved
                ? 'bg-[#238636] border-[#238636] text-white hover:bg-[#2ea043]'
                : 'bg-transparent border-[#30363d] text-[#c9d1d9] hover:bg-[#21262d] hover:border-[#484f58]'
            }`}
          >
            {isSaved ? '✓ Saved' : 'Save Developer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatsCards({ stats }: { stats: DeveloperProfileData['stats'] }) {
  const cards = [
    { label: 'Repositories', value: formatNumber(stats.repos), icon: '📁' },
    { label: 'Stars', value: formatNumber(stats.stars), icon: '⭐' },
    { label: 'Forks', value: formatNumber(stats.forks), icon: '🍴' },
    { label: 'Followers', value: formatNumber(stats.followers), icon: '👥' },
    { label: 'Following', value: formatNumber(stats.following), icon: '👤' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="bg-[#161b22] rounded-xl border border-[#30363d] p-4 text-center">
          <span className="text-2xl">{card.icon}</span>
          <div className="text-2xl font-bold text-[#f0f6fc] mt-1">{card.value}</div>
          <div className="text-xs text-[#8b949e] mt-1">{card.label}</div>
        </div>
      ))}
    </div>
  );
}

function LanguageDistribution({ languages }: { languages: DeveloperProfileData['languages'] }) {
  if (!languages.length) {
    return (
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Languages</h3>
        <p className="text-[#8b949e]">No language data available</p>
      </div>
    );
  }

  const totalBytes = languages.reduce((sum, l) => sum + l.bytes, 0);

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
      <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Languages</h3>
      <div className="space-y-3">
        {languages.slice(0, 8).map((lang, i) => (
          <div key={i} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color || LANGUAGE_COLORS.Other }}
            />
            <span className="text-sm text-[#c9d1d9] min-w-[100px] truncate">{lang.name}</span>
            <div className="flex-1 h-2 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${lang.pct}%`,
                  backgroundColor: lang.color || LANGUAGE_COLORS.Other,
                }}
              />
            </div>
            <span className="text-xs text-[#8b949e] min-w-[40px] text-right">
              {lang.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContributionHeatmap({ contributions }: { contributions: DeveloperProfileData['contributions'] }) {
  if (!contributions.weeks.length) {
    return (
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Contribution Calendar</h3>
        <p className="text-[#8b949e]">No contribution data available</p>
      </div>
    );
  }

  // Flatten all days
  const allDays = contributions.weeks.flatMap((w) => w.days);
  const maxCount = Math.max(...allDays.map((d) => d.count), 1);

  // Get last 52 weeks (1 year)
  const recentWeeks = contributions.weeks.slice(-52);

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#f0f6fc]">Contribution Calendar</h3>
        <span className="text-sm text-[#8b949e]">{formatNumber(contributions.total)} contributions in the last year</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" cellSpacing="2" cellPadding="0">
          <tbody>
            {recentWeeks.map((week, wi) => (
              <tr key={wi}>
                {week.days.map((day, di) => (
                  <td
                    key={di}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: day.count > 0
                        ? `rgba(56, 161, 105, ${0.2 + (day.count / maxCount) * 0.8})`
                        : '#161b22',
                    }}
                    title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-[#8b949e]">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: i === 0
                  ? '#161b22'
                  : `rgba(56, 161, 105, ${0.2 + (i / 4) * 0.8})`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function ActivityTimeline({ activity }: { activity: DeveloperProfileData['activity'] }) {
  if (!activity.length) {
    return (
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Recent Activity</h3>
        <p className="text-[#8b949e]">No recent public activity</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
      <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activity.slice(0, 10).map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-[#0d1117] rounded-lg border border-[#30363d] hover:border-[#484f58] transition-colors"
          >
            <span className="text-xl mt-0.5">{getActivityIcon(item.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#c9d1d9]">{getActivityText(item)}</p>
              <p className="text-xs text-[#8b949e] mt-1">
                {item.repo && (
                  <a
                    href={item.repoUrl || `https://github.com/${item.repo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#58a6ff] hover:text-[#79c0ff]"
                  >
                    {item.repo}
                  </a>
                )}
                <span className="mx-2">·</span>
                {formatDate(item.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepositoryGrid({ repositories }: { repositories: DeveloperProfileData['repositories'] }) {
  if (!repositories.length) {
    return (
      <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6 mb-8">
        <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Popular Repositories</h3>
        <p className="text-[#8b949e]">No public repositories found</p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-[#f0f6fc] mb-4">Popular Repositories</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo) => (
          <Link
            key={repo.id}
            to={`/repository?owner=${repo.fullName.split('/')[0]}&repo=${repo.fullName.split('/')[1]}`}
            className="bg-[#161b22] rounded-xl border border-[#30363d] p-4 hover:border-[#484f58] transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-base font-semibold text-[#f0f6fc] truncate">{repo.name}</h4>
              {repo.isPrivate && (
                <span className="text-xs px-1.5 py-0.5 bg-[#30363d] text-[#8b949e] rounded">Private</span>
              )}
            </div>
            {repo.description && (
              <p className="text-sm text-[#8b949e] mb-3 line-clamp-2">{repo.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#8b949e]">
              {repo.language && (
                <span className="flex items-center gap-1">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.Other }}
                  />
                  {repo.language}
                </span>
              )}
              <span className="flex items-center gap-1">⭐ {formatNumber(repo.stars)}</span>
              <span className="flex items-center gap-1">🍴 {formatNumber(repo.forks)}</span>
            </div>
            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {repo.topics.slice(0, 4).map((topic) => (
                  <span
                    key={topic}
                    className="text-xs px-2 py-0.5 bg-[#21262d] text-[#8b949e] rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DeveloperProfilePage() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get('username');
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<DeveloperProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const checkSaved = async () => {
    if (!username) return;
    try {
      const saved = await isFavorite(username);
      setIsSaved(saved);
    } catch {
      // ignore
    }
  };

  const handleSaveToggle = async () => {
    if (!username || !authUser) {
      navigate('/login');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await removeFavorite('developer', username);
        setIsSaved(false);
      } else {
        await addFavorite({
          type: 'developer',
          targetId: username,
          targetName: username,
          targetUrl: `https://github.com/${username}`,
          metadata: { avatarUrl: profile?.user.avatarUrl },
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!username) {
      setLoading(false);
      setError('Username not specified in URL');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDeveloperProfile(username);
        setProfile(data);
        await checkSaved();
      } catch (e: any) {
        setError(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, authUser]);

  if (!username) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-2">Developer Profile</h1>
          <p className="text-[#8b949e]">Username not specified in URL. Use <code className="bg-[#21262d] px-2 py-1 rounded">?username=octocat</code></p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <div className="flex flex-col md:flex-row gap-6 mb-8 p-6 bg-[#161b22] rounded-xl border border-[#30363d]">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="space-y-6">
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
            <Skeleton className="h-5 w-1/4 mb-4" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
            <Skeleton className="h-5 w-1/4 mb-4" />
            <Skeleton className="h-40" />
          </div>
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
            <Skeleton className="h-5 w-1/4 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          </div>
          <div className="bg-[#161b22] rounded-xl border border-[#30363d] p-6">
            <Skeleton className="h-5 w-1/4 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-2">Failed to Load Profile</h1>
          <p className="text-[#8b949e] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-[#f0f6fc] mb-2">Developer Not Found</h1>
          <p className="text-[#8b949e]">No profile found for <strong>@{username}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6 page-enter">
      <ProfileHeader user={profile.user} isSaved={isSaved} onSaveToggle={handleSaveToggle} />
      <StatsCards stats={profile.stats} />
      <LanguageDistribution languages={profile.languages} />
      <ContributionHeatmap contributions={profile.contributions} />
      <ActivityTimeline activity={profile.activity} />
      <RepositoryGrid repositories={profile.repositories} />
    </div>
  );
}