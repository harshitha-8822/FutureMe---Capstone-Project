import pool from '../db/pool.js';

// ── Profiles ─────────────────────────────────────────────
export async function insertProfile(userId, p) {
  const [r] = await pool.execute(
    `INSERT INTO profiles
       (user_id, title, interests, skills, education_level, field_of_study, academic_details, preferred_location)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      p.title || (p.fieldOfStudy ? `${p.fieldOfStudy} profile` : 'My Profile'),
      JSON.stringify(p.interests || []),
      JSON.stringify(p.skills || []),
      p.educationLevel || '',
      p.fieldOfStudy || null,
      p.academicDetails || null,
      p.preferredLocation || null,
    ],
  );
  return r.insertId;
}

// ── Recommendations ──────────────────────────────────────
export async function insertRecommendation(userId, profileId, resultData) {
  const [r] = await pool.execute(
    'INSERT INTO recommendations (user_id, profile_id, careers) VALUES (?, ?, ?)',
    [userId, profileId, JSON.stringify(resultData)],
  );
  return r.insertId;
}

export async function listRecommendations(userId) {
  const [rows] = await pool.execute(
    `SELECT r.id, r.careers, r.created_at,
            p.id AS profile_id, p.title, p.interests, p.skills,
            p.education_level, p.field_of_study, p.preferred_location
       FROM recommendations r
       JOIN profiles p ON p.id = r.profile_id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC`,
    [userId],
  );
  return rows;
}

export async function deleteRecommendation(userId, id) {
  const [r] = await pool.execute(
    'DELETE FROM recommendations WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return r.affectedRows > 0;
}

// ── Roadmaps ─────────────────────────────────────────────
export async function insertRoadmap(userId, careerName, roadmap, profileId = null) {
  const [r] = await pool.execute(
    'INSERT INTO roadmaps (user_id, profile_id, career_name, roadmap) VALUES (?, ?, ?, ?)',
    [userId, profileId, careerName, JSON.stringify(roadmap)],
  );
  return r.insertId;
}

export async function listRoadmaps(userId) {
  const [rows] = await pool.execute(
    'SELECT id, career_name, roadmap, created_at FROM roadmaps WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
  );
  return rows;
}

export async function deleteRoadmap(userId, id) {
  const [r] = await pool.execute(
    'DELETE FROM roadmaps WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return r.affectedRows > 0;
}

// ── Skill gap analyses ───────────────────────────────────
export async function insertSkillGap(userId, careerName, readiness, analysis) {
  const [r] = await pool.execute(
    'INSERT INTO skill_gaps (user_id, career_name, readiness, analysis) VALUES (?, ?, ?, ?)',
    [userId, careerName, readiness, JSON.stringify(analysis)],
  );
  return r.insertId;
}

export async function listSkillGaps(userId) {
  const [rows] = await pool.execute(
    'SELECT id, career_name, readiness, analysis, created_at FROM skill_gaps WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
  );
  return rows;
}

export async function deleteSkillGap(userId, id) {
  const [r] = await pool.execute(
    'DELETE FROM skill_gaps WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return r.affectedRows > 0;
}
