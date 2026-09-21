import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { findUserById } from '../models/user.js';
import { query } from '../config/db.js';

const router = Router();

// Helper to get user id from JWT (set by middleware)
router.use(requireAuth);

// GET all favorites for authenticated user
router.get('/', async (req, res) => {
  const userId = (req as any).userId;
  const result = await query('SELECT id, type, target, created_at FROM favorites WHERE user_id = $1', [userId]);
  res.json(result.rows);
});

// POST a new favorite
router.post('/', async (req, res) => {
  const userId = (req as any).userId;
  const { type, target } = req.body as { type: string; target: string };
  if (!type || !target) return res.status(400).json({ error: 'type and target required' });
  try {
    const result = await query(
      `INSERT INTO favorites (user_id, type, target) VALUES ($1, $2, $3) ON CONFLICT (user_id, type, target) DO NOTHING RETURNING *`,
      [userId, type, target]
    );
    res.status(201).json(result.rows[0] ?? { message: 'Already exists' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE a favorite by target (fullName or username)
router.delete('/:type/:target', async (req, res) => {
  const userId = (req as any).userId;
  const { type, target } = req.params;
  if (!['repository', 'developer'].includes(type)) {
    return res.status(400).json({ error: 'Invalid favorite type' });
  }
  try {
    const result = await query('DELETE FROM favorites WHERE user_id = $1 AND type = $2 AND target = $3 RETURNING *', [userId, type, decodeURIComponent(target)]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Favorite not found' });
    res.json({ message: 'Deleted' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

export default router;
