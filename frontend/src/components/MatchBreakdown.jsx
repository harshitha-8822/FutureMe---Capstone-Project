const LABELS = { interest: 'Interest', skills: 'Skills', education: 'Education' };

/**
 * The three AI-rated parts behind a match score, as labelled bars.
 * Hover a row for the AI's one-line reason. Parts the student left blank
 * (weight 0) are shown faded and don't count towards the score.
 */
export default function MatchBreakdown({ parts = [], cap }) {
  if (!parts.length) return null;
  return (
    <>
    <ul className="space-y-1.5" aria-label="Match breakdown">
      {parts.map(({ key, score, reason, weight }) => {
        const skipped = weight === 0;
        return (
          <li key={key} title={skipped ? 'Not given — not counted' : reason || undefined}
            className={`flex items-center gap-2 text-xs ${skipped ? 'opacity-40' : ''}`}>
            <span className="w-[4.5rem] shrink-0 font-medium text-slate-500">{LABELS[key] || key}</span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                style={{ width: `${skipped ? 0 : score}%` }} />
            </span>
            <span className="w-7 shrink-0 text-right font-semibold tabular-nums text-slate-700">{skipped ? '—' : score}</span>
          </li>
        );
      })}
    </ul>
    {cap && (
      <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800" title={cap.reason || undefined}>
        Capped from {cap.from}%: your current education route doesn't lead here.
      </p>
    )}
    </>
  );
}

/** One-line explanation of the formula, expandable so it costs no space by default. */
export function MatchFormula() {
  return (
    <details className="group text-sm text-slate-500">
      <summary className="cursor-pointer list-none font-semibold text-brand-700 hover:text-brand-800">
        How is the match % calculated? <span className="inline-block transition group-open:rotate-90">›</span>
      </summary>
      <div className="mt-2 rounded-xl bg-surface p-3 ring-1 ring-slate-200">
        <p className="font-mono text-xs text-slate-700 sm:text-sm">
          Match = 40% Interest + 35% Skills + 25% Education
        </p>
        <p className="mt-1.5 text-xs">
          AI rates each part from 0 to 100; the formula combines them. Parts you left blank are skipped.
          If your education route can't lead to a career (education under 40), its match is capped at education + 20.
        </p>
      </div>
    </details>
  );
}
