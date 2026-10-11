/**
 * Weight sensitivity analysis — no model calls.
 * Re-scores every career from the six recorded recommendation runs (raw/) under
 * alternative weightings and compares each ranking with the default (0.40/0.35/0.25).
 * The education cap (gate 40, margin 20) and missing-input rescaling are applied
 * exactly as in the application.
 * Usage: node weight_sensitivity.mjs   → prints a table, writes sensitivity.json
 */
import fs from 'fs';
import path from 'path';

const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const RAW = path.join(HERE, 'raw');

const SCHEMES = [
  { name: 'Default', w: { interest: 0.40, skills: 0.35, education: 0.25 } },
  { name: 'Equal', w: { interest: 1 / 3, skills: 1 / 3, education: 1 / 3 } },
  { name: 'Interest-heavy', w: { interest: 0.50, skills: 0.30, education: 0.20 } },
  { name: 'Skills-heavy', w: { interest: 0.30, skills: 0.45, education: 0.25 } },
  { name: 'Education-heavy', w: { interest: 0.35, skills: 0.30, education: 0.35 } },
  { name: 'Interest + skills only', w: { interest: 0.50, skills: 0.50, education: 0.00 } },
];

/** Same rule as scoreMatch() in backend/src/services/ai.service.js, with weights as a parameter. */
function score(fit, profile, w) {
  const given = {
    interest: (profile.interests || []).length > 0,
    skills: (profile.skills || []).length > 0,
    education: Boolean(profile.educationLevel || profile.fieldOfStudy),
  };
  const keys = Object.keys(w).filter((k) => w[k] > 0);
  const used = keys.filter((k) => given[k]);
  const active = used.length ? used : keys;
  const tw = active.reduce((s, k) => s + w[k], 0);
  const m = Math.round(active.reduce((s, k) => s + fit[k] * w[k], 0) / tw);
  const e = fit.education;
  return given.education && e < 40 && m > e + 20 ? e + 20 : m;
}

/** Kendall's tau-b between two score lists over the same items. */
function kendallTau(a, b) {
  let c = 0; let d = 0; let ta = 0; let tb = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      const x = Math.sign(a[i] - a[j]); const y = Math.sign(b[i] - b[j]);
      if (x === 0 && y === 0) continue;
      if (x === 0) ta++; else if (y === 0) tb++; else if (x === y) c++; else d++;
    }
  }
  const denom = Math.sqrt((c + d + ta) * (c + d + tb));
  return denom ? (c - d) / denom : 1;
}

const rank = (scores) => scores.map((s, i) => ({ s, i })).sort((p, q) => q.s - p.s || p.i - q.i).map((x) => x.i);

const runs = fs.readdirSync(RAW).filter((f) => f.startsWith('recommend_')).sort().map((f) => {
  const r = JSON.parse(fs.readFileSync(path.join(RAW, f), 'utf8'));
  return {
    file: f,
    profile: r.request,
    careers: r.response.careers.map((c) => ({
      name: c.name,
      fit: Object.fromEntries(c.matchBreakdown.map((p) => [p.key, p.score])),
    })),
  };
});

const base = SCHEMES[0].w;
const results = SCHEMES.map(({ name, w }) => {
  let taus = []; let top1 = 0; let top3 = []; let absDiff = [];
  for (const run of runs) {
    const b = run.careers.map((c) => score(c.fit, run.profile, base));
    const s = run.careers.map((c) => score(c.fit, run.profile, w));
    taus.push(kendallTau(b, s));
    const rb = rank(b); const rs = rank(s);
    if (rb[0] === rs[0]) top1++;
    const k = Math.min(3, rb.length);
    top3.push(rb.slice(0, k).filter((i) => rs.slice(0, k).includes(i)).length / k);
    s.forEach((v, i) => absDiff.push(Math.abs(v - b[i])));
  }
  const mean = (xs) => xs.reduce((t, x) => t + x, 0) / xs.length;
  return {
    scheme: name,
    weights: `${w.interest.toFixed(2)} / ${w.skills.toFixed(2)} / ${w.education.toFixed(2)}`,
    meanKendallTau: +mean(taus).toFixed(2),
    minKendallTau: +Math.min(...taus).toFixed(2),
    topCareerUnchanged: `${top1}/${runs.length}`,
    meanTop3Overlap: +mean(top3).toFixed(2),
    meanAbsScoreChange: +mean(absDiff).toFixed(1),
    maxAbsScoreChange: Math.max(...absDiff),
  };
});

console.log(`Runs: ${runs.length}, careers: ${runs.reduce((t, r) => t + r.careers.length, 0)}\n`);
console.table(results);
fs.writeFileSync(path.join(HERE, 'sensitivity.json'), JSON.stringify({ runs: runs.length, results }, null, 2));
