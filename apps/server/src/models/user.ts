import { query } from '../config/db.js';

export interface User {
  id: string;
  email: string;
  password_hash?: string; // nullable for OAuth‑only accounts
  name?: string;
  username?: string;
  avatar_url?: string;
  github_id?: string;
  github_username?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Insert a new user. Returns the created row.
 */
export const createUser = async (user: Partial<User>) => {
  const result = await query(
    `INSERT INTO users (email, password_hash, name, username, avatar_url, github_id, github_username)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      user.email,
      user.password_hash ?? null,
      user.name ?? null,
      user.username ?? null,
      user.avatar_url ?? null,
      user.github_id ?? null,
      user.github_username ?? null,
    ]
  );
  return result.rows[0] as User;
};

export const findUserByEmail = async (email: string) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] as User | undefined;
};

export const findUserById = async (id: string) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] as User | undefined;
};

export const findUserByGithubId = async (githubId: string) => {
  const result = await query('SELECT * FROM users WHERE github_id = $1', [githubId]);
  return result.rows[0] as User | undefined;
};

export const linkGithubToUser = async (userId: string, githubId: string, githubUsername: string, avatarUrl?: string) => {
  const result = await query(
    `UPDATE users SET github_id = $1, github_username = $2, avatar_url = COALESCE($3, avatar_url)
     WHERE id = $4 RETURNING *`,
    [githubId, githubUsername, avatarUrl ?? null, userId]
  );
  return result.rows[0] as User;
};
