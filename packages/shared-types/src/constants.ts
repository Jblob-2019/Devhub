/**
 * Shared constants for DevHub
 * Used by both client and server for consistent language colors, etc.
 */

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Java: '#b07219',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  Zig: '#ec915c',
  Other: '#8b949e',
};

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Other;
}

export const CATEGORIES = [
  'All',
  'AI/ML',
  'Web Development',
  'DevTools',
  'Mobile',
  'Data Science',
  'Cybersecurity',
  'Game Development',
  'Creative Coding',
] as const;

export type Category = typeof CATEGORIES[number];
