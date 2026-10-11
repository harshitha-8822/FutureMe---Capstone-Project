import { recommendCareers, generateRoadmap, analyzeSkillGap } from '../services/ai.service.js';

/**
 * POST /api/recommend
 * Body: { interests[], skills[], educationLevel, fieldOfStudy, academicDetails, preferredLocation }
 * Public (no login needed) — the core spine of FutureMe.
 */
export async function postRecommend(req, res, next) {
  try {
    const profile = req.body || {};

    if (
      (!profile.interests || profile.interests.length === 0) &&
      (!profile.skills || profile.skills.length === 0) &&
      !profile.fieldOfStudy
    ) {
      return res.status(400).json({
        error: 'Please provide at least some interests, skills, or your field of study.',
      });
    }

    const data = await recommendCareers(profile);
    return res.json(data);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/roadmap
 * Body: { careerName, profile? }
 * Public — generates a guided path for one chosen career.
 */
export async function postRoadmap(req, res, next) {
  try {
    const { careerName, profile = {}, gapSkills = [] } = req.body || {};
    if (!careerName || typeof careerName !== 'string') {
      return res.status(400).json({ error: 'careerName is required.' });
    }
    const gaps = Array.isArray(gapSkills) ? gapSkills.filter((g) => typeof g === 'string').slice(0, 8) : [];
    const roadmap = await generateRoadmap(careerName, profile, gaps);
    return res.json(roadmap);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/skill-gap
 * Body: { careerName, profile? }
 * Public — the hero feature: compares the student's current skills with
 * what the target career needs, skill by skill.
 */
export async function postSkillGap(req, res, next) {
  try {
    const { careerName, profile = {} } = req.body || {};
    if (!careerName || typeof careerName !== 'string' || !careerName.trim()) {
      return res.status(400).json({ error: 'Pick a target career first.' });
    }
    const analysis = await analyzeSkillGap(careerName.trim().slice(0, 120), profile);
    return res.json(analysis);
  } catch (err) {
    next(err);
  }
}
