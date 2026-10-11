import {
  insertProfile,
  insertRecommendation,
  listRecommendations,
  deleteRecommendation,
  insertRoadmap,
  listRoadmaps,
  deleteRoadmap,
  insertSkillGap,
  listSkillGaps,
  deleteSkillGap,
} from '../models/library.model.js';

/**
 * Save a set of recommendations together with the profile that produced them.
 * POST /api/library/recommendations
 * Body: { profile, result }  (result = { summary, careers })
 */
export async function saveRecommendation(req, res, next) {
  try {
    const { profile, result } = req.body || {};
    if (!profile || !result?.careers) {
      return res.status(400).json({ error: 'profile and result.careers are required.' });
    }
    const profileId = await insertProfile(req.user.id, profile);
    const id = await insertRecommendation(req.user.id, profileId, result);
    return res.status(201).json({ id, profileId });
  } catch (err) {
    next(err);
  }
}

/** POST /api/library/roadmaps  Body: { careerName, roadmap } */
export async function saveRoadmap(req, res, next) {
  try {
    const { careerName, roadmap } = req.body || {};
    if (!careerName || !roadmap) {
      return res.status(400).json({ error: 'careerName and roadmap are required.' });
    }
    const id = await insertRoadmap(req.user.id, careerName, roadmap);
    return res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

/** GET /api/library  → everything the user has saved, for the dashboard. */
export async function getLibrary(req, res, next) {
  try {
    const [recommendations, roadmaps, skillGaps] = await Promise.all([
      listRecommendations(req.user.id),
      listRoadmaps(req.user.id),
      listSkillGaps(req.user.id),
    ]);
    return res.json({ recommendations, roadmaps, skillGaps });
  } catch (err) {
    next(err);
  }
}

export async function removeRecommendation(req, res, next) {
  try {
    const ok = await deleteRecommendation(req.user.id, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found.' });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function removeRoadmap(req, res, next) {
  try {
    const ok = await deleteRoadmap(req.user.id, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found.' });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** POST /api/library/skill-gaps  Body: { careerName, analysis } */
export async function saveSkillGap(req, res, next) {
  try {
    const { careerName, analysis } = req.body || {};
    if (!careerName || !Array.isArray(analysis?.skills)) {
      return res.status(400).json({ error: 'careerName and analysis are required.' });
    }
    const readiness = Math.max(0, Math.min(100, Math.round(Number(analysis.readinessScore) || 0)));
    const id = await insertSkillGap(req.user.id, careerName, readiness, analysis);
    return res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function removeSkillGap(req, res, next) {
  try {
    const ok = await deleteSkillGap(req.user.id, req.params.id);
    if (!ok) return res.status(404).json({ error: 'Not found.' });
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
