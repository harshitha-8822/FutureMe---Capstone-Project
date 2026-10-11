import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  saveRecommendation,
  saveRoadmap,
  getLibrary,
  removeRecommendation,
  removeRoadmap,
  saveSkillGap,
  removeSkillGap,
} from '../controllers/library.controller.js';

const router = Router();

// Everything here requires a logged-in user.
router.use(requireAuth);

router.get('/', getLibrary);
router.post('/recommendations', saveRecommendation);
router.delete('/recommendations/:id', removeRecommendation);
router.post('/roadmaps', saveRoadmap);
router.delete('/roadmaps/:id', removeRoadmap);
router.post('/skill-gaps', saveSkillGap);
router.delete('/skill-gaps/:id', removeSkillGap);

export default router;
