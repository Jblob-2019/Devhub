import { Repository, Developer } from '../types.js';

export const FEATURED_REPO: Repository = {
  id: 'nextjs',
  name: 'next.js',
  owner: 'vercel',
  fullName: 'vercel/next.js',
  description: "The React Framework for the Web. Used by some of the world's largest companies, Next.js enables you to create high-quality full-stack web applications with optimized performance.",
  stars: '118k',
  forks: '26.3k',
  watchers: '3.1k',
  openIssues: '2.4k',
  language: 'TypeScript',
  topics: ['react', 'framework', 'ssr', 'web', 'jamstack'],
  updatedAt: '2h ago',
  featured: true,
  languages: [
    { name: 'TypeScript', pct: 68 },
    { name: 'JavaScript', pct: 22 },
    { name: 'CSS', pct: 7 },
    { name: 'Other', pct: 3 },
  ],
  recentCommitsCount: 14200,
};

export const TRENDING_REPOSITORIES: Repository[] = [
  {
    id: 'nextjs',
    name: 'next.js',
    owner: 'vercel',
    fullName: 'vercel/next.js',
    description: 'The React Framework for the Web',
    stars: '118k',
    forks: '26.3k',
    language: 'JavaScript',
    topics: ['react', 'framework', 'ssr'],
    updatedAt: '2h ago',
    languages: [{ name: 'TypeScript', pct: 68 }, { name: 'JavaScript', pct: 22 }],
  },
  {
    id: 'vscode',
    name: 'vscode',
    owner: 'microsoft',
    fullName: 'microsoft/vscode',
    description: 'Visual Studio Code is a code editor redefined and optimized for building and debugging modern web and cloud applications.',
    stars: '156k',
    forks: '27.8k',
    language: 'TypeScript',
    topics: ['editor', 'ide', 'developer-tools'],
    updatedAt: '1h ago',
    languages: [{ name: 'TypeScript', pct: 93 }, { name: 'CSS', pct: 5 }],
  },
  // additional repos can be added here
];

export const TOP_DEVELOPERS: Developer[] = [
  {
    id: 'torvalds',
    name: 'Linus Torvalds',
    username: 'torvalds',
    bio: 'Creator of Linux and Git. Working on making computers work reliably.',
    reposCount: 12,
    followers: '241k',
    following: '0',
    primaryLanguage: 'C',
    location: 'Portland, OR',
    company: 'Linux Foundation',
    blog: 'github.com/torvalds',
    joinedDate: 'Jun 2011',
    contributionsPastYear: 4821,
  },
  // other developers omitted for brevity
];

export const CATEGORIES = [
  'All',
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'React',
  'AI/ML',
  'DevOps',
  'Web3',
  'Mobile',
];
