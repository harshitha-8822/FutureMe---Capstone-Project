import { Link } from 'react-router-dom';
import {
  Target, Compass, Sparkles, UserRound, ScanSearch, Route,
  Cpu, Landmark, HeartPulse, Scale, Palette, Megaphone, Building2, GraduationCap, FlaskConical, Wrench,
} from 'lucide-react';
import SkillGapPreview from '../components/SkillGapPreview.jsx';

const STREAMS = [
  { label: 'Technology', icon: Cpu, c: 'text-brand-700 bg-brand-50' },
  { label: 'Commerce', icon: Landmark, c: 'text-emerald-700 bg-emerald-50' },
  { label: 'Science', icon: FlaskConical, c: 'text-sky-700 bg-sky-50' },
  { label: 'Healthcare', icon: HeartPulse, c: 'text-rose-700 bg-rose-50' },
  { label: 'Law', icon: Scale, c: 'text-amber-700 bg-amber-50' },
  { label: 'Design', icon: Palette, c: 'text-fuchsia-700 bg-fuchsia-50' },
  { label: 'Media', icon: Megaphone, c: 'text-orange-700 bg-orange-50' },
  { label: 'Government', icon: Building2, c: 'text-slate-700 bg-slate-100' },
  { label: 'Education', icon: GraduationCap, c: 'text-violet-700 bg-violet-50' },
  { label: 'Vocational', icon: Wrench, c: 'text-yellow-700 bg-yellow-50' },
];

const STEPS = [
  { icon: UserRound, t: 'Tell us about you', d: 'Interests, skills, studies. 1 minute.', tone: 'from-brand-500 to-violet-500' },
  { icon: ScanSearch, t: 'See your skill gap', d: 'Skills you have vs. skills the job needs.', tone: 'from-violet-500 to-fuchsia-500' },
  { icon: Route, t: 'Follow your roadmap', d: 'Courses, projects and exams, step by step.', tone: 'from-fuchsia-500 to-rose-500' },
];

export default function Home() {
  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 lg:grid-cols-2 lg:pt-20">
        <div className="text-center lg:text-left">
          <span className="chip bg-surface text-slate-700 shadow-sm ring-1 ring-slate-200">🇮🇳 Built for Indian students</span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl lg:text-6xl">
            See what you have.<br />
            <span className="text-gradient">Learn what you need.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-slate-600 lg:mx-0">
            Find careers that suit you, see the skills you’re missing, and get a plan to get there.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/skill-gap" className="btn-primary px-6 py-3.5 text-base">
              <Target className="h-5 w-5" /> Check my skill gap
            </Link>
            <Link to="/explore" className="btn-ghost px-6 py-3.5 text-base">
              <Compass className="h-5 w-5" /> Find my careers
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">Free · No sign-up needed</p>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand-400/30 via-violet-400/30 to-fuchsia-400/30 blur-2xl" />
          <SkillGapPreview className="relative animate-float" />
          <div className="absolute -right-4 -top-6 hidden items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-lg ring-1 ring-slate-100 sm:flex">
            <Sparkles className="h-5 w-5 text-fuchsia-500" />
            <div className="text-sm">
              <div className="font-bold text-slate-900">Fix SQL first</div>
              <div className="text-xs text-slate-500">4 weeks · free course</div>
            </div>
          </div>
        </div>
      </section>

      {/* Streams */}
      <section className="mx-auto max-w-6xl px-4">
        <p className="text-center eyebrow">Every stream, not just engineering</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {STREAMS.map(({ label, icon: Icon, c }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${c}`}>
              <Icon className="h-4 w-4" /> {label}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-extrabold text-slate-900">3 simple steps</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className="card relative p-6 text-center">
              <span className="absolute right-4 top-3 font-display text-5xl font-extrabold text-slate-100">{i + 1}</span>
              <div className={`relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.tone} text-white shadow-md`}>
                <s.icon className="h-7 w-7" />
              </div>
              <h3 className="relative mt-4 text-lg font-bold text-slate-900">{s.t}</h3>
              <p className="relative mt-1 text-sm text-slate-500">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
