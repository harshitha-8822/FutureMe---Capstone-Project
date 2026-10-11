import { findUserById } from '../models/user.model.js';
import { getUserProfile, upsertUserProfile, updateUserName } from '../models/profile.model.js';
import { signToken } from '../utils/jwt.js';

const EMPTY = {
  interests: [], skills: [], educationLevel: '', fieldOfStudy: '', academicDetails: '', preferredLocation: '',
};

/** Trimmed, de-duplicated list of short strings. */
function cleanList(v, max = 30) {
  if (!Array.isArray(v)) return [];
  const seen = new Set();
  const out = [];
  for (const item of v) {
    if (typeof item !== 'string') continue;
    const s = item.trim().slice(0, 60);
    if (s && !seen.has(s.toLowerCase())) {
      seen.add(s.toLowerCase());
      out.push(s);
    }
  }
  return out.slice(0, max);
}

const cleanText = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** GET /api/profile → { user, profile } */
export async function getProfile(req, res, next) {
  try {
    const [user, profile] = await Promise.all([findUserById(req.user.id), getUserProfile(req.user.id)]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user, profile: profile || EMPTY });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profile
 * Body: { name, interests[], skills[], educationLevel, fieldOfStudy, academicDetails, preferredLocation }
 * Returns a fresh token too, since the name is part of the JWT payload.
 */
export async function updateProfile(req, res, next) {
  try {
    const body = req.body || {};
    const name = cleanText(body.name, 120);
    if (!name) return res.status(400).json({ error: 'Name cannot be empty.' });

    const profile = {
      interests: cleanList(body.interests),
      skills: cleanList(body.skills),
      educationLevel: cleanText(body.educationLevel, 80),
      fieldOfStudy: cleanText(body.fieldOfStudy, 160),
      academicDetails: cleanText(body.academicDetails, 1000),
      preferredLocation: cleanText(body.preferredLocation, 120),
    };

    await updateUserName(req.user.id, name);
    await upsertUserProfile(req.user.id, profile);

    const user = await findUserById(req.user.id);
    const token = signToken({ id: user.id, name: user.name, email: user.email });
    return res.json({ user, profile, token });
  } catch (err) {
    next(err);
  }
}
