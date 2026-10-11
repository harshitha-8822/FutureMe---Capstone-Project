import { Router } from 'express';
import { postRecommend, postRoadmap, postSkillGap } from '../controllers/recommend.controller.js';

// Core spine — public endpoints. `limiter` guards only these AI calls.
export default function recommendRoutes(limiter) {
  const router = Router();
  router.post('/recommend', limiter, postRecommend);
  router.post('/roadmap', limiter, postRoadmap);
  router.post('/skill-gap', limiter, postSkillGap);
  return router;
}
