import axios from 'axios';

/**
 * Central axios instance. In dev, Vite proxies /api -> http://localhost:5000.
 * A JWT (added in the auth layer) is attached automatically if present.
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('futureme_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Core spine endpoints ─────────────────────────────────
export const getCareerRecommendations = (profile) =>
  api.post('/recommend', profile).then((r) => r.data);

export const getCareerRoadmap = (careerName, profile, gapSkills = []) =>
  api.post('/roadmap', { careerName, profile, gapSkills }).then((r) => r.data);

export const getSkillGap = (careerName, profile) =>
  api.post('/skill-gap', { careerName, profile }).then((r) => r.data);

// ── Auth ─────────────────────────────────────────────────
export const registerUser = (payload) =>
  api.post('/auth/register', payload).then((r) => r.data);

export const loginUser = (payload) =>
  api.post('/auth/login', payload).then((r) => r.data);

export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

// ── User profile (requires auth) ─────────────────────────
export const fetchProfile = () => api.get('/profile').then((r) => r.data);

export const updateProfile = (payload) => api.put('/profile', payload).then((r) => r.data);

// ── Saved library (requires auth) ────────────────────────
export const saveRecommendation = (profile, result) =>
  api.post('/library/recommendations', { profile, result }).then((r) => r.data);

export const saveRoadmap = (careerName, roadmap) =>
  api.post('/library/roadmaps', { careerName, roadmap }).then((r) => r.data);

export const fetchLibrary = () => api.get('/library').then((r) => r.data);

export const deleteRecommendation = (id) =>
  api.delete(`/library/recommendations/${id}`).then((r) => r.data);

export const deleteRoadmap = (id) =>
  api.delete(`/library/roadmaps/${id}`).then((r) => r.data);

export const saveSkillGap = (careerName, analysis) =>
  api.post('/library/skill-gaps', { careerName, analysis }).then((r) => r.data);

export const deleteSkillGap = (id) =>
  api.delete(`/library/skill-gaps/${id}`).then((r) => r.data);

/** Friendly message from an axios error. */
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.response?.data?.error || (err?.request && !err?.response ? 'Cannot reach the server. Is the backend running?' : fallback);

export default api;
