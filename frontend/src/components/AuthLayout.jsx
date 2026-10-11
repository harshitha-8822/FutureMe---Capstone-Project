import { Target, Bookmark, TrendingUp } from 'lucide-react';

const PERKS = [
  { icon: Target, t: 'Track your skill gaps' },
  { icon: Bookmark, t: 'Save careers & roadmaps' },
  { icon: TrendingUp, t: 'Watch your readiness grow' },
];

/** Split layout for login / sign-up: brand panel + form card. */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="page max-w-5xl">
      <div className="card grid overflow-hidden md:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 p-10 text-white md:block">
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold leading-tight">Your career,<br />one skill at a time.</h2>
          <ul className="relative mt-8 space-y-4">
            {PERKS.map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3 font-medium">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25"><Icon className="h-5 w-5" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
