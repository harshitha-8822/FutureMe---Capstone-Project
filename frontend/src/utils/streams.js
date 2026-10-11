import {
  Cpu, BarChart3, Landmark, FlaskConical, HeartPulse, Scale, Palette, Megaphone,
  Building2, GraduationCap, Wrench, Trophy, Briefcase, Leaf,
} from 'lucide-react';

/**
 * Stream → colour + icon, matched by keyword so it also works for streams the
 * AI invents. Colour follows the stream, never its position in the list.
 */
const STREAMS = [
  { match: /data|ai|analytics/i, icon: BarChart3, tone: 'from-cyan-500 to-blue-600', chip: 'bg-cyan-50 text-cyan-700' },
  { match: /tech|software|engineer|computer|it\b/i, icon: Cpu, tone: 'from-brand-500 to-violet-600', chip: 'bg-brand-50 text-brand-700' },
  { match: /commerce|financ|account|bank/i, icon: Landmark, tone: 'from-emerald-500 to-teal-600', chip: 'bg-emerald-50 text-emerald-700' },
  { match: /science|research/i, icon: FlaskConical, tone: 'from-sky-500 to-indigo-600', chip: 'bg-sky-50 text-sky-700' },
  { match: /health|medic|pharma|nurs/i, icon: HeartPulse, tone: 'from-rose-500 to-pink-600', chip: 'bg-rose-50 text-rose-700' },
  { match: /law|legal/i, icon: Scale, tone: 'from-amber-500 to-orange-600', chip: 'bg-amber-50 text-amber-700' },
  { match: /design|creative|art/i, icon: Palette, tone: 'from-fuchsia-500 to-pink-600', chip: 'bg-fuchsia-50 text-fuchsia-700' },
  { match: /media|market|journal|commun/i, icon: Megaphone, tone: 'from-orange-500 to-red-500', chip: 'bg-orange-50 text-orange-700' },
  { match: /gov|public|civil/i, icon: Building2, tone: 'from-gray-600 to-gray-800', chip: 'bg-slate-100 text-slate-700' },
  { match: /educat|teach/i, icon: GraduationCap, tone: 'from-violet-500 to-purple-600', chip: 'bg-violet-50 text-violet-700' },
  { match: /vocation|trade|skill/i, icon: Wrench, tone: 'from-yellow-500 to-amber-600', chip: 'bg-yellow-50 text-yellow-800' },
  { match: /sport|fitness/i, icon: Trophy, tone: 'from-lime-500 to-green-600', chip: 'bg-lime-50 text-lime-800' },
  { match: /agri|environment/i, icon: Leaf, tone: 'from-green-500 to-emerald-600', chip: 'bg-green-50 text-green-700' },
];

const FALLBACK = { icon: Briefcase, tone: 'from-brand-500 to-fuchsia-500', chip: 'bg-brand-50 text-brand-700' };

export function streamStyle(stream = '') {
  return STREAMS.find((s) => s.match.test(stream)) || FALLBACK;
}
