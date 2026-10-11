import { CheckCircle2, CircleDashed, AlertCircle, Rocket, TrendingUp, Sprout, Trophy } from 'lucide-react';

/** Weeks → short, human duration: "~6 wks", "~8 mo", "~1.5 yrs". */
export function formatWeeks(weeks) {
  const w = Math.round(Number(weeks) || 0);
  if (!w) return '—';
  if (w <= 16) return `~${w} wks`;
  if (w < 52) return `~${Math.round(w / 4.33)} mo`;
  const yrs = Math.round((w / 52) * 2) / 2;
  return `~${yrs} ${yrs === 1 ? 'yr' : 'yrs'}`;
}

export const LEVELS = ['None', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];

/**
 * Readiness = weighted share of required skill levels the student already has.
 * Must-have skills count double. Mirrors readinessScore() in
 * backend/src/services/ai.service.js — keep the two in sync.
 */
export function readinessScore(skills = []) {
  let have = 0;
  let need = 0;
  for (const s of skills) {
    const w = s.importance === 'Must-have' ? 2 : 1;
    have += Math.min(s.currentLevel, s.requiredLevel) * w;
    need += s.requiredLevel * w;
  }
  return need ? Math.round((have / need) * 100) : 0;
}

/** Per-skill status. Always rendered with an icon + label, never colour alone. */
export const STATUS = {
  strong: {
    label: 'Ready',
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    soft: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  partial: {
    label: 'Improve',
    icon: CircleDashed,
    bar: 'bg-amber-400',
    text: 'text-amber-700',
    soft: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  missing: {
    label: 'Gap',
    icon: AlertCircle,
    bar: 'bg-rose-500',
    text: 'text-rose-700',
    soft: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
};

export function skillStatus(s) {
  if (s.currentLevel >= s.requiredLevel) return 'strong';
  if (s.currentLevel === 0 || s.requiredLevel - s.currentLevel >= 2) return 'missing';
  return 'partial';
}

/** Overall readiness band: label, colours and icon for the headline score. */
export function readinessBand(score) {
  if (score >= 85) return { label: 'Job ready', icon: Trophy, ring: '#10b981', soft: 'bg-emerald-50 text-emerald-700' };
  if (score >= 65) return { label: 'Almost there', icon: Rocket, ring: '#6366f1', soft: 'bg-brand-50 text-brand-700' };
  if (score >= 40) return { label: 'Getting there', icon: TrendingUp, ring: '#f59e0b', soft: 'bg-amber-50 text-amber-700' };
  return { label: 'Early stage', icon: Sprout, ring: '#f43f5e', soft: 'bg-rose-50 text-rose-700' };
}
