import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Compass, Map, Trash2, ArrowRight, Clock, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useApp } from '../context/AppContext.jsx';
import {
  fetchLibrary, deleteRecommendation, deleteRoadmap, deleteSkillGap, errorMessage,
} from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { ScoreRing, ErrorBox, EmptyState } from '../components/ui.jsx';
import { readinessBand, skillStatus } from '../utils/skillGap.js';

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

/** Two-tap delete: first tap arms it, second tap deletes. */
function DeleteButton({ onConfirm }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
        armed ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-rose-50 hover:text-rose-700'}`}
      aria-label="Delete">
      <Trash2 className="h-3.5 w-3.5" /> {armed && 'Delete?'}
    </button>
  );
}

function SectionTitle({ icon: Icon, title, count, tone }) {
  return (
    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
      {title}
      {count > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">{count}</span>}
    </h2>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { setProfile, setResult, putCached } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await fetchLibrary());
    } catch (err) {
      setError(errorMessage(err, 'Could not load your saved items.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (kind, id) => {
    const fn = { recommendations: deleteRecommendation, roadmaps: deleteRoadmap, skillGaps: deleteSkillGap }[kind];
    try {
      await fn(id);
      setData((d) => ({ ...d, [kind]: d[kind].filter((r) => r.id !== id) }));
    } catch (err) {
      setError(errorMessage(err, 'Could not delete. Please try again.'));
    }
  };

  // Re-open saved items instantly by seeding the cache instead of calling the AI again.
  const openGap = (g) => {
    putCached('gap', g.career_name, g.analysis);
    navigate(`/career/${encodeURIComponent(g.career_name)}?tab=gap`);
  };
  const openRoadmap = (r) => {
    putCached('roadmap', r.career_name, r.roadmap);
    navigate(`/career/${encodeURIComponent(r.career_name)}?tab=roadmap`);
  };
  const openMatches = (r) => {
    setProfile({
      interests: r.interests || [],
      skills: r.skills || [],
      educationLevel: r.education_level || '',
      fieldOfStudy: r.field_of_study || '',
      preferredLocation: r.preferred_location || '',
    });
    setResult(r.careers);
    navigate('/results');
  };

  if (loading) return <Loader label="Loading your dashboard…" />;

  const recommendations = data?.recommendations || [];
  const roadmaps = data?.roadmaps || [];
  const skillGaps = data?.skillGaps || [];
  const best = skillGaps.reduce((m, g) => Math.max(m, g.readiness || 0), 0);

  const STATS = [
    { label: 'Best readiness', value: skillGaps.length ? `${best}%` : '—', icon: Trophy, tone: 'from-emerald-500 to-teal-500' },
    { label: 'Skill gaps', value: skillGaps.length, icon: Target, tone: 'from-fuchsia-500 to-rose-500' },
    { label: 'Career sets', value: recommendations.length, icon: Compass, tone: 'from-brand-500 to-violet-500' },
    { label: 'Roadmaps', value: roadmaps.length, icon: Map, tone: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="page">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Hi, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="mt-1 text-slate-500">Your progress at a glance.</p>
      </div>

      {error && <div className="mt-6"><ErrorBox message={error} onRetry={load} /></div>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-3 p-4">
            <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-2xl font-extrabold text-slate-900">{value}</div>
              <div className="text-xs font-medium text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Skill gaps — the hero */}
      <section className="mt-10">
        <SectionTitle icon={Target} title="Skill gaps" count={skillGaps.length} tone="bg-fuchsia-50 text-fuchsia-700" />
        {skillGaps.length === 0 ? (
          <div className="mt-4">
            <EmptyState icon={Target} title="No skill gaps saved" text="Check how ready you are for a job."
              action={<Link to="/skill-gap" className="btn-primary">Check my skill gap</Link>} />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {skillGaps.map((g) => {
              const band = readinessBand(g.readiness);
              const gaps = (g.analysis?.skills || []).filter((s) => skillStatus(s) !== 'strong').slice(0, 3);
              return (
                <div key={g.id} className="card flex flex-col p-5">
                  <div className="flex items-start gap-4">
                    <ScoreRing value={g.readiness} size={64} stroke={7} color={band.ring} label="Readiness">
                      <span className="text-sm font-extrabold text-slate-900">{g.readiness}%</span>
                    </ScoreRing>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold leading-snug text-slate-900">{g.career_name}</h3>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold ${band.soft}`}>{band.label}</span>
                    </div>
                    <DeleteButton onConfirm={() => remove('skillGaps', g.id)} />
                  </div>
                  {gaps.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {gaps.map((s) => (
                        <span key={s.name} className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">{s.name}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-xs text-slate-400">{fmtDate(g.created_at)}</span>
                    <button onClick={() => openGap(g)} className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800">
                      Open <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        {/* Career matches */}
        <section>
          <SectionTitle icon={Compass} title="Career matches" count={recommendations.length} tone="bg-brand-50 text-brand-700" />
          {recommendations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              None yet. <Link to="/explore" className="font-semibold text-brand-700">Find your careers →</Link>
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recommendations.map((r) => {
                const careers = r.careers?.careers || [];
                return (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-900">{r.field_of_study || r.title || 'Exploration'}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">{fmtDate(r.created_at)}</span>
                        <DeleteButton onConfirm={() => remove('recommendations', r.id)} />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {careers.slice(0, 4).map((c) => (
                        <span key={c.name} className="chip">{c.name} · {c.matchScore}</span>
                      ))}
                    </div>
                    <button onClick={() => openMatches(r)} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800">
                      View all <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Roadmaps */}
        <section>
          <SectionTitle icon={Map} title="Roadmaps" count={roadmaps.length} tone="bg-amber-50 text-amber-700" />
          {roadmaps.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">None yet. Open any career and save its roadmap.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {roadmaps.map((r) => (
                <div key={r.id} className="card flex items-center gap-4 p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <Map className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-bold text-slate-900">{r.career_name}</h3>
                    <p className="flex items-center gap-2 text-xs text-slate-400">
                      {r.roadmap?.timelineMonths ? <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />~{r.roadmap.timelineMonths} months</span> : null}
                      <span>{fmtDate(r.created_at)}</span>
                    </p>
                  </div>
                  <DeleteButton onConfirm={() => remove('roadmaps', r.id)} />
                  <button onClick={() => openRoadmap(r)} className="btn-soft px-3 py-1.5 text-sm">Open</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
