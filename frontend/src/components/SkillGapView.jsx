import { useMemo, useState } from 'react';
import {
  Bookmark, BookmarkCheck, Zap, Award, ListOrdered, Clock, BookOpen, Lightbulb,
  CheckCircle2, AlertCircle, CalendarClock, MousePointerClick,
} from 'lucide-react';
import { ScoreRing } from './ui.jsx';
import { LEVELS, STATUS, formatWeeks, readinessBand, readinessScore, skillStatus } from '../utils/skillGap.js';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'gaps', label: 'Gaps' },
  { key: 'strong', label: 'Ready' },
];

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/15">
      <div className="flex items-center gap-1.5 text-xs font-medium text-white/75">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="mt-0.5 font-display text-xl font-extrabold text-white">{value}</div>
    </div>
  );
}

/** One skill: status + a 5-step level bar the student can tap to correct their level. */
function SkillRow({ skill, onLevel }) {
  const status = STATUS[skillStatus(skill)];
  const StatusIcon = status.icon;
  return (
    <li className="rounded-xl border border-slate-100 p-3.5 transition hover:border-slate-200 hover:bg-slate-50/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-slate-900">{skill.name}</span>
            {skill.importance === 'Must-have' && (
              <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-50">Must</span>
            )}
            <span className="text-xs text-slate-400">{skill.category}</span>
          </div>
          {skill.tip && (
            <p className="mt-1 flex items-start gap-1 text-xs text-slate-500">
              <Lightbulb className="mt-px h-3.5 w-3.5 shrink-0 text-amber-500" /> {skill.tip}
            </p>
          )}
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ${status.soft}`}>
          <StatusIcon className="h-3.5 w-3.5" /> {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex flex-1 gap-1" role="group" aria-label={`Your level in ${skill.name}`}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= skill.currentLevel;
            const needed = n <= skill.requiredLevel;
            return (
              <button
                key={n}
                type="button"
                onClick={() => onLevel(n === skill.currentLevel && n === 1 ? 0 : n)}
                title={`Set my level: ${LEVELS[n]}`}
                aria-label={`Set ${skill.name} to ${LEVELS[n]}`}
                className={`h-3 flex-1 rounded-full transition hover:scale-y-150 ${
                  filled ? status.bar : needed ? 'bg-slate-200 ring-1 ring-inset ring-slate-300' : 'bg-slate-100'
                }`}
              />
            );
          })}
        </div>
        <div className="w-28 shrink-0 text-right text-xs leading-tight sm:w-44">
          <span className={`font-semibold ${status.text}`}>{LEVELS[skill.currentLevel]}</span>
          <span className="block text-slate-400 sm:inline"> / need {LEVELS[skill.requiredLevel]}</span>
        </div>
      </div>
    </li>
  );
}

export default function SkillGapView({ analysis, onChange, onSave, saveState }) {
  const [filter, setFilter] = useState('all');
  const { skills = [], priorityGaps = [], quickWins = [], strengths = [] } = analysis;

  const score = readinessScore(skills);
  const band = readinessBand(score);
  const BandIcon = band.icon;

  const counts = useMemo(() => {
    const ready = skills.filter((s) => skillStatus(s) === 'strong').length;
    const mustGaps = skills.filter((s) => s.importance === 'Must-have' && skillStatus(s) !== 'strong').length;
    return { ready, mustGaps };
  }, [skills]);

  const visible = skills
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => (filter === 'all' ? true : filter === 'strong' ? skillStatus(s) === 'strong' : skillStatus(s) !== 'strong'));

  const setLevel = (idx, level) => {
    const next = skills.map((s, i) => (i === idx ? { ...s, currentLevel: level } : s));
    onChange({ ...analysis, skills: next, readinessScore: readinessScore(next) });
  };

  return (
    <div className="space-y-6">
      {/* ── Headline: readiness ─────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex justify-center rounded-full bg-surface p-2 shadow-lg">
            <ScoreRing value={score} size={140} stroke={12} color={band.ring} label="Job readiness">
              <div className="leading-none">
                <div className="font-display text-4xl font-extrabold text-slate-900">{score}%</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">ready</div>
              </div>
            </ScoreRing>
          </div>

          <div className="flex-1">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${band.soft}`}>
              <BandIcon className="h-4 w-4" /> {band.label}
            </span>
            <p className="mt-3 text-lg font-medium leading-snug text-white/95 sm:text-xl">{analysis.verdict}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:max-w-md">
              <Stat icon={CheckCircle2} value={`${counts.ready}/${skills.length}`} label="Skills ready" />
              <Stat icon={AlertCircle} value={counts.mustGaps} label="Must-have gaps" />
              <Stat icon={CalendarClock} value={formatWeeks(analysis.weeksToReady)} label="To job-ready" />
            </div>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-2">
          <button onClick={onSave} disabled={saveState === 'saving' || saveState === 'saved'}
            className="btn bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25">
            {saveState === 'saved' ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {saveState === 'error' && <p className="text-sm text-rose-700">Could not save. Please try again.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* ── Skill by skill ─────────────────────────────── */}
        <section className="card p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">Skill by skill</h2>
            <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
              {FILTERS.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-3 py-1 font-semibold transition ${
                    filter === f.key ? 'bg-surface text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <MousePointerClick className="h-3.5 w-3.5 text-brand-500" />
            Not accurate? Tap the bars to set your real level. The score updates instantly.
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {Object.values(STATUS).map(({ label, icon: I, text }) => (
              <span key={label} className="inline-flex items-center gap-1"><I className={`h-3.5 w-3.5 ${text}`} /> {label}</span>
            ))}
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-4 rounded-full bg-slate-200 ring-1 ring-inset ring-slate-300" /> Level needed
            </span>
          </div>

          <ul className="mt-4 space-y-2.5">
            {visible.map(({ s, i }) => (
              <SkillRow key={`${s.name}-${i}`} skill={s} onLevel={(lvl) => setLevel(i, lvl)} />
            ))}
            {visible.length === 0 && (
              <li className="py-6 text-center text-sm text-slate-400">Nothing here.</li>
            )}
          </ul>
        </section>

        {/* ── Action plan ─────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {priorityGaps.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ListOrdered className="h-5 w-5 text-rose-500" /> Fix these first
              </h2>
              <ol className="mt-4 space-y-3">
                {priorityGaps.map((g, i) => (
                  <li key={`${g.skill}-${i}`} className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{g.skill}</span>
                        {g.weeks ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500">
                            <Clock className="h-3.5 w-3.5" /> {g.weeks}w
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-600">{g.action}</p>
                      {g.resource && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                          <BookOpen className="h-3 w-3" /> {g.resource}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {quickWins.length > 0 && (
            <section className="card border-amber-200 bg-gradient-to-br from-amber-50 to-surface p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Zap className="h-5 w-5 text-amber-500" /> Quick wins <span className="text-sm font-medium text-slate-400">· 2 weeks</span>
              </h2>
              <ul className="mt-3 space-y-2">
                {quickWins.map((w) => (
                  <li key={w} className="flex items-start gap-2 text-sm text-slate-700">
                    <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {w}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {strengths.length > 0 && (
            <section className="card border-emerald-200 bg-gradient-to-br from-emerald-50 to-surface p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <Award className="h-5 w-5 text-emerald-500" /> Your strengths
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {strengths.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {s}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
