import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchProfile } from '../api/client.js';

/**
 * Lightweight in-memory app state for the core spine:
 *  - the profile the student submitted
 *  - the AI's career recommendations
 *  - a per-career cache of skill gap analyses and roadmaps, so switching tabs
 *    or coming back to a career doesn't call the AI again
 * When a user signs in, their saved career profile (if any) becomes the starting
 * profile, so the forms come pre-filled. Signing out clears it all.
 * Persisted to sessionStorage so a page refresh doesn't lose results.
 */
const AppContext = createContext(null);

function load(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled — state still works in memory */
  }
}

export function AppProvider({ children }) {
  const [profile, setProfileState] = useState(() => load('futureme_profile', null));
  const [result, setResultState] = useState(() => load('futureme_result', null));
  const [cache, setCacheState] = useState(() => load('futureme_cache', {}));

  const setCache = (next) => {
    setCacheState(next);
    store('futureme_cache', next);
  };

  // A new profile invalidates every cached analysis built from the old one.
  const setProfile = (p) => {
    setProfileState(p);
    store('futureme_profile', p);
    setCache({});
  };
  const setResult = (r) => {
    setResultState(r);
    store('futureme_result', r);
  };
  const getCached = (kind, careerName) => cache[`${kind}:${careerName}`];
  const putCached = (kind, careerName, value) =>
    setCacheState((prev) => {
      const next = { ...prev, [`${kind}:${careerName}`]: value };
      store('futureme_cache', next);
      return next;
    });

  const reset = () => {
    setProfileState(null);
    setResultState(null);
    setCache({});
    store('futureme_profile', null);
    store('futureme_result', null);
  };

  const { user } = useAuth();
  const prevUserId = useRef(user?.id ?? null);
  useEffect(() => {
    const prev = prevUserId.current;
    prevUserId.current = user?.id ?? null;
    if (!user) {
      if (prev) reset(); // signed out: don't leave their data in this browser tab
      return;
    }
    if (profile) return; // a profile from this session takes priority
    let cancelled = false;
    fetchProfile()
      .then(({ profile: saved }) => {
        const hasContent = saved && (saved.interests?.length || saved.skills?.length || saved.educationLevel || saved.fieldOfStudy);
        if (!cancelled && hasContent) {
          const { updatedAt, ...p } = saved;
          setProfileState(p);
          store('futureme_profile', p);
        }
      })
      .catch(() => {}); // pre-filling is a convenience; forms still work empty
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <AppContext.Provider
      value={{ profile, setProfile, result, setResult, getCached, putCached, reset }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
