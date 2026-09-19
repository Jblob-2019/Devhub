import { Repository, Developer, CommitItem, ContributorItem } from '../types';

export const FEATURED_REPO: Repository = {
  id: 'nextjs',
  name: 'next.js',
  owner: 'vercel',
  fullName: 'vercel/next.js',
  description: 'The React Framework for the Web. Used by some of the world\'s largest companies, Next.js enables you to create high-quality full-stack web applications with optimized performance.',
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
    { name: 'Other', pct: 3 }
  ],
  recentCommitsCount: 14200
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
    languages: [{ name: 'TypeScript', pct: 68 }, { name: 'JavaScript', pct: 22 }]
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
    languages: [{ name: 'TypeScript', pct: 93 }, { name: 'CSS', pct: 5 }]
  },
  {
    id: 'linux',
    name: 'linux',
    owner: 'torvalds',
    fullName: 'torvalds/linux',
    description: 'Linux kernel source tree and development platform.',
    stars: '166k',
    forks: '50.4k',
    language: 'C',
    topics: ['kernel', 'operating-system', 'c'],
    updatedAt: '30m ago',
    languages: [{ name: 'C', pct: 97 }, { name: 'Assembly', pct: 2 }]
  },
  {
    id: 'rust',
    name: 'rust',
    owner: 'rust-lang',
    fullName: 'rust-lang/rust',
    description: 'Empowering everyone to build reliable and efficient software with zero-cost abstractions.',
    stars: '94.5k',
    forks: '12.1k',
    language: 'Rust',
    topics: ['systems', 'compiler', 'memory-safety'],
    updatedAt: '4h ago',
    languages: [{ name: 'Rust', pct: 91 }, { name: 'Python', pct: 6 }]
  },
  {
    id: 'whisper',
    name: 'whisper',
    owner: 'openai',
    fullName: 'openai/whisper',
    description: 'Robust Speech Recognition via Large-Scale Weak Supervision with state-of-the-art transformer architecture.',
    stars: '63.2k',
    forks: '7.4k',
    language: 'Python',
    topics: ['ai', 'speech-recognition', 'deep-learning', 'transformers'],
    updatedAt: '6h ago',
    languages: [{ name: 'Python', pct: 98 }, { name: 'Other', pct: 2 }]
  },
  {
    id: 'deno',
    name: 'deno',
    owner: 'denoland',
    fullName: 'denoland/deno',
    description: 'A modern, secure runtime for JavaScript and TypeScript built in Rust with V8 engine.',
    stars: '92.8k',
    forks: '5.1k',
    language: 'Rust',
    topics: ['runtime', 'javascript', 'typescript'],
    updatedAt: '3h ago',
    languages: [{ name: 'Rust', pct: 88 }, { name: 'TypeScript', pct: 10 }]
  },
  {
    id: 'vite',
    name: 'vite',
    owner: 'vitejs',
    fullName: 'vitejs/vite',
    description: 'Next generation frontend tooling. It\'s fast!',
    stars: '66.3k',
    forks: '5.8k',
    language: 'TypeScript',
    topics: ['bundler', 'frontend', 'esbuild'],
    updatedAt: '5h ago',
    languages: [{ name: 'TypeScript', pct: 95 }, { name: 'JavaScript', pct: 5 }]
  }
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
    contributionsPastYear: 4821
  },
  {
    id: 'yyx990803',
    name: 'Evan You',
    username: 'yyx990803',
    bio: 'Creator of Vue.js, Vite, and Rolldown. Dedicated open source developer.',
    reposCount: 48,
    followers: '88.2k',
    following: '32',
    primaryLanguage: 'TypeScript',
    location: 'Singapore',
    company: 'Vue / VoidZero',
    blog: 'evanyou.me',
    joinedDate: 'Sep 2010',
    contributionsPastYear: 2650
  },
  {
    id: 'sindresorhus',
    name: 'Sindre Sorhus',
    username: 'sindresorhus',
    bio: 'Full-Time Open-Sourcerer. Maker of refined apps and popular npm packages.',
    reposCount: 1200,
    followers: '47.3k',
    following: '12',
    primaryLanguage: 'JavaScript',
    location: 'Norway',
    company: 'Independent',
    blog: 'sindresorhus.com',
    joinedDate: 'Dec 2009',
    contributionsPastYear: 3100
  },
  {
    id: 'Rich-Harris',
    name: 'Rich Harris',
    username: 'Rich-Harris',
    bio: 'Creator of Svelte and Rollup. Cheerful and opinionated web developer.',
    reposCount: 64,
    followers: '36.8k',
    following: '142',
    primaryLanguage: 'TypeScript',
    location: 'Brooklyn, NY',
    company: 'Vercel',
    blog: 'twitter.com/Rich_Harris',
    joinedDate: 'May 2011',
    contributionsPastYear: 1890
  },
  {
    id: 'tj',
    name: 'TJ Holowaychuk',
    username: 'tj',
    bio: 'Building great software. Apex, Koa, Express alumnus.',
    reposCount: 312,
    followers: '47.1k',
    following: '77',
    primaryLanguage: 'Go',
    location: 'Victoria, BC',
    company: 'Apex Software',
    blog: 'apex.sh',
    joinedDate: 'Jul 2008',
    contributionsPastYear: 1540
  },
  {
    id: 'karpathy',
    name: 'Andrej Karpathy',
    username: 'karpathy',
    bio: 'Building Eureka Labs. Formerly OpenAI, Tesla Autopilot.',
    reposCount: 28,
    followers: '54.6k',
    following: '8',
    primaryLanguage: 'Python',
    location: 'San Francisco, CA',
    company: 'Eureka Labs',
    blog: 'karpathy.ai',
    joinedDate: 'Mar 2011',
    contributionsPastYear: 920
  }
];

export const REPO_COMMITS: CommitItem[] = [
  { sha: 'a3f91c2', message: 'kernel: fix mm/memory.c null ptr dereference in swap cache lookup', author: 'torvalds', timestamp: '2h ago', verified: true },
  { sha: 'b7e2d41', message: 'net: tcp: improve RACK reordering detection under packet loss', author: 'edumazet', timestamp: '4h ago', verified: true },
  { sha: 'c1a8f33', message: 'mm: fix use-after-free in mmap_region() lock cleanup', author: 'vbabka', timestamp: '6h ago', verified: true },
  { sha: 'd4f2c19', message: 'fs: ext4: fix race condition in ext4_es_cache_extent()', author: 'tytso', timestamp: '8h ago', verified: true },
  { sha: 'e5b3a77', message: 'drivers: usb: core: handle disconnected devices gracefully', author: 'gregkh', timestamp: '12h ago', verified: true },
  { sha: 'f29910d', message: 'sched/fair: balance CPU load across SMT cores on idle transition', author: 'mingo', timestamp: '1d ago', verified: true },
];

export const REPO_CONTRIBUTORS: ContributorItem[] = [
  { username: 'torvalds', name: 'Linus Torvalds', commitsCount: 24816, contributionsPct: 32 },
  { username: 'gregkh', name: 'Greg Kroah-Hartman', commitsCount: 16234, contributionsPct: 21 },
  { username: 'tytso', name: 'Theodore Ts\'o', commitsCount: 9821, contributionsPct: 14 },
  { username: 'akpm', name: 'Andrew Morton', commitsCount: 8743, contributionsPct: 11 },
  { username: 'davem330', name: 'David S. Miller', commitsCount: 7632, contributionsPct: 9 },
];
