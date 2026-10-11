/**
 * In-memory MOCK of the mysql2 pool — for testing the app WITHOUT a real
 * MySQL server. Enabled by setting `USE_MOCK_DB=true` in backend/.env.
 *
 * It implements only the queries our models actually use, by matching on the
 * SQL string. Data lives in memory and is LOST on restart — this is purely a
 * "does everything work end-to-end" convenience, not a real database.
 */

const store = {
  users: [],
  profiles: [],
  recommendations: [],
  roadmaps: [],
  skill_gaps: [],
  user_profiles: [],
  seq: { users: 0, profiles: 0, recommendations: 0, roadmaps: 0, skill_gaps: 0 },
};

const now = () => new Date().toISOString();
const norm = (sql) => sql.replace(/\s+/g, ' ').trim();

// Parse values that were stored as JSON strings (mimics mysql2 JSON columns).
function maybeParse(v) {
  if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  }
  return v;
}

async function execute(sqlRaw, params = []) {
  const sql = norm(sqlRaw);

  // ── users ──────────────────────────────────────────────
  if (sql.startsWith('INSERT INTO users')) {
    const [name, email, password_hash] = params;
    const id = ++store.seq.users;
    store.users.push({ id, name, email, password_hash, created_at: now() });
    return [{ insertId: id, affectedRows: 1 }];
  }
  if (sql.includes('FROM users WHERE email')) {
    const [email] = params;
    const u = store.users.find((x) => x.email === email);
    return [u ? [{ id: u.id, name: u.name, email: u.email, password_hash: u.password_hash }] : []];
  }
  if (sql.includes('FROM users WHERE id')) {
    const [id] = params;
    const u = store.users.find((x) => x.id === Number(id));
    return [u ? [{ id: u.id, name: u.name, email: u.email, created_at: u.created_at }] : []];
  }

  if (sql.startsWith('UPDATE users SET name')) {
    const [name, id] = params;
    const u = store.users.find((x) => x.id === Number(id));
    if (u) u.name = name;
    return [{ affectedRows: u ? 1 : 0 }];
  }

  // ── user career profiles ───────────────────────────────
  if (sql.includes('FROM user_profiles WHERE user_id')) {
    const [user_id] = params;
    const p = store.user_profiles.find((x) => x.user_id === Number(user_id));
    return [p ? [{ ...p }] : []];
  }
  if (sql.startsWith('INSERT INTO user_profiles')) {
    const [user_id, interests, skills, education_level, field_of_study, academic_details, preferred_location] = params;
    const row = {
      user_id: Number(user_id), interests, skills, education_level, field_of_study,
      academic_details, preferred_location, updated_at: now(),
    };
    store.user_profiles = store.user_profiles.filter((x) => x.user_id !== row.user_id);
    store.user_profiles.push(row);
    return [{ affectedRows: 1 }];
  }

  // ── profiles ───────────────────────────────────────────
  if (sql.startsWith('INSERT INTO profiles')) {
    const [user_id, title, interests, skills, education_level, field_of_study, academic_details, preferred_location] = params;
    const id = ++store.seq.profiles;
    store.profiles.push({
      id, user_id, title, interests, skills, education_level,
      field_of_study, academic_details, preferred_location, created_at: now(),
    });
    return [{ insertId: id, affectedRows: 1 }];
  }

  // ── recommendations ────────────────────────────────────
  if (sql.startsWith('INSERT INTO recommendations')) {
    const [user_id, profile_id, careers] = params;
    const id = ++store.seq.recommendations;
    store.recommendations.push({ id, user_id, profile_id, careers, created_at: now() });
    return [{ insertId: id, affectedRows: 1 }];
  }
  if (sql.includes('FROM recommendations r')) {
    const [user_id] = params;
    const rows = store.recommendations
      .filter((r) => r.user_id === Number(user_id))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => {
        const p = store.profiles.find((x) => x.id === r.profile_id) || {};
        return {
          id: r.id,
          careers: maybeParse(r.careers),
          created_at: r.created_at,
          profile_id: p.id,
          title: p.title,
          interests: maybeParse(p.interests),
          skills: maybeParse(p.skills),
          education_level: p.education_level,
          field_of_study: p.field_of_study,
          preferred_location: p.preferred_location,
        };
      });
    return [rows];
  }
  if (sql.startsWith('DELETE FROM recommendations')) {
    const [id, user_id] = params;
    const before = store.recommendations.length;
    store.recommendations = store.recommendations.filter(
      (r) => !(r.id === Number(id) && r.user_id === Number(user_id)),
    );
    return [{ affectedRows: before - store.recommendations.length }];
  }

  // ── roadmaps ───────────────────────────────────────────
  if (sql.startsWith('INSERT INTO roadmaps')) {
    const [user_id, profile_id, career_name, roadmap] = params;
    const id = ++store.seq.roadmaps;
    store.roadmaps.push({ id, user_id, profile_id, career_name, roadmap, created_at: now() });
    return [{ insertId: id, affectedRows: 1 }];
  }
  if (sql.includes('FROM roadmaps WHERE user_id')) {
    const [user_id] = params;
    const rows = store.roadmaps
      .filter((r) => r.user_id === Number(user_id))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => ({
        id: r.id,
        career_name: r.career_name,
        roadmap: maybeParse(r.roadmap),
        created_at: r.created_at,
      }));
    return [rows];
  }
  if (sql.startsWith('DELETE FROM roadmaps')) {
    const [id, user_id] = params;
    const before = store.roadmaps.length;
    store.roadmaps = store.roadmaps.filter(
      (r) => !(r.id === Number(id) && r.user_id === Number(user_id)),
    );
    return [{ affectedRows: before - store.roadmaps.length }];
  }

  // ── skill gaps ─────────────────────────────────────────
  if (sql.startsWith('INSERT INTO skill_gaps')) {
    const [user_id, career_name, readiness, analysis] = params;
    const id = ++store.seq.skill_gaps;
    store.skill_gaps.push({ id, user_id, career_name, readiness, analysis, created_at: now() });
    return [{ insertId: id, affectedRows: 1 }];
  }
  if (sql.includes('FROM skill_gaps WHERE user_id')) {
    const [user_id] = params;
    const rows = store.skill_gaps
      .filter((r) => r.user_id === Number(user_id))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .map((r) => ({ ...r, analysis: maybeParse(r.analysis) }));
    return [rows];
  }
  if (sql.startsWith('DELETE FROM skill_gaps')) {
    const [id, user_id] = params;
    const before = store.skill_gaps.length;
    store.skill_gaps = store.skill_gaps.filter(
      (r) => !(r.id === Number(id) && r.user_id === Number(user_id)),
    );
    return [{ affectedRows: before - store.skill_gaps.length }];
  }

  throw new Error(`[mockPool] Unhandled query: ${sql}`);
}

const mockPool = {
  execute,
  query: execute,
  async getConnection() {
    return {
      ping: async () => true,
      release: () => {},
    };
  },
};

export default mockPool;
