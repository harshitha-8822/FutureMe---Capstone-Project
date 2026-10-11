import { useState } from 'react';
import {
  ChevronDown, Clock, IndianRupee, Bookmark, BookmarkCheck, Flag, Hammer, BookOpen,
  FileText, BadgeCheck, FolderGit2, Rocket, Target,
} from 'lucide-react';

const PHASE_TONES = [
  'from-brand-500 to-violet-500',
  'from-violet-500 to-fuchsia-500',
  'from-fuchsia-500 to-rose-500',
  'from-rose-500 to-orange-500',
  'from-orange-500 to-amber-500',
];

function Phase({ phase, index, open, onToggle, last }) {
  const tone = PHASE_TONES[index % PHASE_TONES.length];
  return (
    <li className="relative pl-12">
      {!last && <span className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-0.5 bg-slate-200" />}
      <span className={`absolute left-0 top-1 grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${tone} font-bold text-white shadow-md`}>
        {index + 1}
      </span>

      <div className="card overflow-hidden">
        <button onClick={onToggle} className="flex w-full items-center justify-between gap-3 p-4 text-left" aria-expanded={open}>
          <div>
            <h3 className="font-bold text-slate-900">{phase.title}</h3>
            {phase.goal && <p className="mt-0.5 text-sm text-slate-500">{phase.goal}</p>}
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="space-y-4 border-t border-slate-100 p-4 animate-fade-up">
            {phase.skillsToLearn?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {phase.skillsToLearn.map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            )}

            {phase.resources?.length > 0 && (
              <div>
                <p className="eyebrow flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Learn from</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {phase.resources.map((r, j) => (
                    <li key={j} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                      <div className="font-semibold text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500">{[r.type, r.note].filter(Boolean).join(' · ')}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase.projects?.length > 0 && (
              <div>
                <p className="eyebrow flex items-center gap-1"><Hammer className="h-3.5 w-3.5" /> Build</p>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
                  {phase.projects.map((pr, j) => (
                    <li key={j} className="flex gap-2"><span className="text-brand-500">▸</span>{pr}</li>
                  ))}
                </ul>
              </div>
            )}

            {phase.milestone && (
              <p className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" /> {phase.milestone}
              </p>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

function ListCard({ icon: Icon, title, items, tone }) {
  if (!items?.length) return null;
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 font-bold text-slate-900">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
        {title}
      </h3>
      <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
        {items.map((t) => <li key={t} className="flex gap-2"><span className="text-slate-300">•</span>{t}</li>)}
      </ul>
    </div>
  );
}

export default function RoadmapView({ roadmap, focusGaps = [], onSave, saveState }) {
  const [open, setOpen] = useState(0);
  const phases = roadmap.phases || [];

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 bg-gradient-to-br from-surface to-brand-50/60 p-5 sm:flex-row sm:items-center">
        <p className="flex-1 text-slate-700">{roadmap.overview}</p>
        <div className="flex flex-wrap gap-2 sm:flex-col">
          {roadmap.timelineMonths ? (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-slate-800 shadow-sm">
              <Clock className="h-4 w-4 text-brand-700" /> ~{roadmap.timelineMonths} months
            </span>
          ) : null}
          {roadmap.estimatedStartingSalaryINR && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-sm font-bold text-slate-800 shadow-sm">
              <IndianRupee className="h-4 w-4 text-emerald-700" /> {roadmap.estimatedStartingSalaryINR}
            </span>
          )}
        </div>
      </div>

      {focusGaps.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Target className="h-4 w-4 text-rose-500" /> Built around your gaps:
          {focusGaps.map((g) => (
            <span key={g} className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">{g}</span>
          ))}
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Your path</h2>
        <button onClick={onSave} disabled={saveState === 'saving' || saveState === 'saved'} className="btn-ghost px-3 py-2 text-sm">
          {saveState === 'saved' ? <BookmarkCheck className="h-4 w-4 text-emerald-700" /> : <Bookmark className="h-4 w-4" />}
          {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save roadmap'}
        </button>
      </div>
      {saveState === 'error' && <p className="-mt-4 text-sm text-rose-700">Could not save. Please try again.</p>}

      <ol className="space-y-4">
        {phases.map((p, i) => (
          <Phase key={i} phase={p} index={i} open={open === i} last={i === phases.length - 1}
            onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </ol>

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard icon={FileText} title="Entry exams" items={roadmap.entryExams} tone="bg-amber-50 text-amber-700" />
        <ListCard icon={BadgeCheck} title="Certifications" items={roadmap.certifications} tone="bg-sky-50 text-sky-700" />
        <ListCard icon={FolderGit2} title="Portfolio tips" items={roadmap.portfolioTips} tone="bg-fuchsia-50 text-fuchsia-700" />
        {roadmap.firstJobStrategy && (
          <div className="card p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Rocket className="h-4 w-4" /></span>
              Landing your first job
            </h3>
            <p className="mt-3 text-sm text-slate-700">{roadmap.firstJobStrategy}</p>
          </div>
        )}
      </div>
    </div>
  );
}
