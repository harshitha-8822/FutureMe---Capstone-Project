import pool from '../db/pool.js';

/**
 * A user's saved career profile (one per user). Pre-fills the career search
 * and skill gap forms so returning students don't retype everything.
 */

const parse = (v) => {
  if (typeof v !== 'string') return v ?? [];
  try {
    return JSON.parse(v);
  } catch {
    return [];
  }
};

export async function getUserProfile(userId) {
  const [rows] = await pool.execute(
    `SELECT interests, skills, education_level, field_of_study, academic_details, preferred_location, updated_at
       FROM user_profiles WHERE user_id = ? LIMIT 1`,
    [userId],
  );
  const r = rows[0];
  if (!r) return null;
  return {
    interests: parse(r.interests),
    skills: parse(r.skills),
    educationLevel: r.education_level || '',
    fieldOfStudy: r.field_of_study || '',
    academicDetails: r.academic_details || '',
    preferredLocation: r.preferred_location || '',
    updatedAt: r.updated_at,
  };
}

export async function upsertUserProfile(userId, p) {
  await pool.execute(
    `INSERT INTO user_profiles
       (user_id, interests, skills, education_level, field_of_study, academic_details, preferred_location)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       interests = VALUES(interests), skills = VALUES(skills), education_level = VALUES(education_level),
       field_of_study = VALUES(field_of_study), academic_details = VALUES(academic_details),
       preferred_location = VALUES(preferred_location)`,
    [
      userId,
      JSON.stringify(p.interests),
      JSON.stringify(p.skills),
      p.educationLevel,
      p.fieldOfStudy,
      p.academicDetails,
      p.preferredLocation,
    ],
  );
}

export async function updateUserName(userId, name) {
  await pool.execute('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
}
