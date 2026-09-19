import { Router } from 'express';
import { FEATURED_REPO, TRENDING_REPOSITORIES, TOP_DEVELOPERS, CATEGORIES } from '../services/data';

const router = Router();

router.get('/featured-repo', (req, res) => {
  res.json(FEATURED_REPO);
});

router.get('/trending-repositories', (req, res) => {
  res.json(TRENDING_REPOSITORIES);
});

router.get('/top-developers', (req, res) => {
  res.json(TOP_DEVELOPERS);
});

router.get('/categories', (req, res) => {
  res.json(CATEGORIES);
});

export default router;
