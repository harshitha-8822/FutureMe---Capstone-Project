/**
 * FutureMe — functional evaluation used in the manuscript.
 *
 * Part A (no AI calls): deterministic checks of the scoring functions.
 * Part B (9 AI calls):  repeated recommendation runs (consistency, latency,
 *                       formula agreement), two skill-gap analyses and one
 *                       gap-aware roadmap.
 *
 * Usage (backend running on :5000):
 *   node run_evaluation.mjs "<path to backend/src/services/ai.service.js>"
 * Raw responses are written to ./raw/, a summary to ./summary.json.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const API = 'http://localhost:5000/api';
const HERE = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1'));
const RAW = path.join(HERE, 'raw');
fs.mkdirSync(RAW, { recursive: true });

const ai = await import(pathToFileURL(process.argv[2]).href);
const summary = { runAt: new Date().toISOString(), model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' };

// ── Part A: deterministic scoring checks ─────────────────────
const full = { interests: ['x'], skills: ['y'], educationLevel: 'UG' };
const unit = [
  ['All parts given', { interest: 90, skills: 60, education: 80 }, full, 77],
  ['Skills omitted -> rescaled', { interest: 90, skills: 60, education: 80 }, { interests: ['x'], educationLevel: 'UG' }, 86],
  ['Nothing given -> all parts used', { interest: 90, skills: 60, education: 80 }, {}, 77],
  ['Education gate triggers cap', { interest: 95, skills: 40, education: 5 }, full, 25],
  ['Education 40 (gate not hit)', { interest: 95, skills: 40, education: 40 }, full, 62],
  ['Low education, low total (no cap)', { interest: 40, skills: 30, education: 39 }, full, 36],
  ['Education blank -> no cap', { interest: 95, skills: 40, education: 5 }, { interests: ['x'], skills: ['y'] }, 69],
  ['Out-of-range inputs clamped', { interest: 140, skills: -20, education: 100 }, full, 65],
];
summary.unitScoring = unit.map(([name, fit, profile, expected]) => {
  const got = ai.scoreMatch(fit, profile).matchScore;
  return { name, fit, expected, got, pass: got === expected };
});
const R = (skills) => ai.readinessScore(skills);
const sk = (c, r, imp = 'Must-have') => ({ currentLevel: c, requiredLevel: r, importance: imp });
const readinessCases = [
  ['All requirements met', [sk(3, 3), sk(4, 2, 'Nice-to-have')], 100],
  ['Nothing met', [sk(0, 3), sk(0, 2, 'Nice-to-have')], 0],
  ['Must-have weighted double', [sk(3, 3), sk(0, 3, 'Nice-to-have')], 67],
  ['Surplus level gives no extra credit', [sk(5, 2), sk(0, 2)], 50],
];
summary.unitReadiness = readinessCases.map(([name, skills, expected]) => {
  const got = R(skills);
  return { name, expected, got, pass: got === expected };
});

// ── Part B: live calls ────────────────────────────────────────
async function call(endpoint, body, tag) {
  const t0 = performance.now();
  const res = await fetch(`${API}/${endpoint}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const ms = Math.round(performance.now() - t0);
  const json = await res.json();
  fs.writeFileSync(path.join(RAW, `${tag}.json`), JSON.stringify({ request: body, status: res.status, ms, response: json }, null, 2));
  console.log(`${tag}: HTTP ${res.status} in ${ms} ms${json.error ? ' — ' + json.error.slice(0, 120) : ''}`);
  return { ms, status: res.status, json };
}

const PROFILES = {
  A: { interests: ['Business', 'Finance'], skills: ['Excel', 'Accounting'], educationLevel: 'Undergraduate (2nd year)', fieldOfStudy: 'B.Com' },
  B: { interests: ['Medicine', 'Healthcare', 'Helping people'], skills: ['Communication', 'Accounting'], educationLevel: 'Class 12 (Commerce)', fieldOfStudy: 'Commerce' },
};

const recRuns = {};
for (const [id, profile] of Object.entries(PROFILES)) {
  recRuns[id] = [];
  for (let run = 1; run <= 3; run++) recRuns[id].push(await call('recommend', profile, `recommend_${id}_run${run}`));
}

const jaccard = (a, b) => {
  const A = new Set(a); const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / new Set([...A, ...B]).size;
};
const norm = (n) => n.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();

summary.recommendation = {};
for (const [id, runs] of Object.entries(recRuns)) {
  const ok = runs.filter((r) => r.status === 200);
  const careersPerRun = ok.map((r) => r.json.careers);
  const formulaChecks = careersPerRun.flat().map((c) => {
    const re = ai.scoreMatch(Object.fromEntries(c.matchBreakdown.map((p) => [p.key, p.score])), PROFILES[id]).matchScore;
    return re === c.matchScore;
  });
  const names = careersPerRun.map((cs) => cs.map((c) => norm(c.name)));
  const pairs = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) pairs.push(jaccard(names[i], names[j]));
  const byName = {};
  careersPerRun.flat().forEach((c) => (byName[norm(c.name)] ||= []).push(c.matchScore));
  const repeated = Object.entries(byName).filter(([, s]) => s.length > 1)
    .map(([name, s]) => ({ name, scores: s, range: Math.max(...s) - Math.min(...s) }));
  summary.recommendation[id] = {
    profile: PROFILES[id],
    successfulRuns: ok.length,
    latencyMs: runs.map((r) => r.ms),
    careersPerRun: careersPerRun.map((cs) => cs.length),
    careerNames: careersPerRun.map((cs) => cs.map((c) => `${c.name} (${c.matchScore})`)),
    formulaAgreement: `${formulaChecks.filter(Boolean).length}/${formulaChecks.length}`,
    cappedCareers: careersPerRun.flat().filter((c) => c.matchCap).map((c) => `${c.name}: ${c.matchCap.from}->${c.matchScore}`),
    jaccardBetweenRuns: pairs.map((x) => +x.toFixed(2)),
    meanJaccard: +(pairs.reduce((s, x) => s + x, 0) / (pairs.length || 1)).toFixed(2),
    repeatedCareers: repeated,
    maxScoreRange: repeated.length ? Math.max(...repeated.map((r) => r.range)) : null,
    meanScoreRange: repeated.length ? +(repeated.reduce((s, r) => s + r.range, 0) / repeated.length).toFixed(1) : null,
  };
}

// Skill gap: profile A -> Data Analyst; a CSE student -> Software Engineer.
const GAP = [
  ['gap_A_DataAnalyst', 'Data Analyst', PROFILES.A],
  ['gap_C_SoftwareEngineer', 'Software Engineer', { interests: ['Technology'], skills: ['Python', 'Java', 'SQL', 'Git'], educationLevel: 'Undergraduate (final year)', fieldOfStudy: 'B.Tech CSE' }],
];
summary.skillGap = [];
let firstGap = null;
for (const [tag, careerName, profile] of GAP) {
  const r = await call('skill-gap', { careerName, profile }, tag);
  if (r.status !== 200) { summary.skillGap.push({ tag, status: r.status }); continue; }
  const g = r.json;
  firstGap ||= g;
  const inRange = g.skills.every((s) => s.requiredLevel >= 1 && s.requiredLevel <= 5 && s.currentLevel >= 0 && s.currentLevel <= 5);
  const status = (s) => (s.currentLevel >= s.requiredLevel ? 'ready' : s.currentLevel === 0 || s.requiredLevel - s.currentLevel >= 2 ? 'gap' : 'improve');
  const counts = g.skills.reduce((m, s) => ({ ...m, [status(s)]: (m[status(s)] || 0) + 1 }), {});
  summary.skillGap.push({
    tag, careerName, latencyMs: r.ms, skills: g.skills.length, levelsInRange: inRange,
    readinessReturned: g.readinessScore, readinessRecomputed: ai.readinessScore(g.skills),
    statusCounts: counts, priorityGaps: g.priorityGaps.length, quickWins: g.quickWins.length, weeksToReady: g.weeksToReady,
  });
}

// Gap-aware roadmap for the first analysis.
if (firstGap) {
  const gapSkills = firstGap.priorityGaps.map((g) => g.skill);
  const r = await call('roadmap', { careerName: 'Data Analyst', profile: PROFILES.A, gapSkills }, 'roadmap_A_DataAnalyst');
  if (r.status === 200) {
    const learned = r.json.phases.flatMap((p) => p.skillsToLearn).join(' | ').toLowerCase();
    const covered = gapSkills.filter((s) => learned.includes(s.toLowerCase().split(/[ (]/)[0]));
    summary.roadmap = {
      latencyMs: r.ms, phases: r.json.phases.length, timelineMonths: r.json.timelineMonths,
      gapSkills, gapSkillsCoveredInPhases: `${covered.length}/${gapSkills.length}`, covered,
      hasFirstJobStrategy: Boolean(r.json.firstJobStrategy),
    };
  }
}

fs.writeFileSync(path.join(HERE, 'summary.json'), JSON.stringify(summary, null, 2));
console.log('\nUnit scoring:', summary.unitScoring.filter((u) => u.pass).length, '/', summary.unitScoring.length,
  '| readiness:', summary.unitReadiness.filter((u) => u.pass).length, '/', summary.unitReadiness.length);
console.log(JSON.stringify({ recommendation: summary.recommendation, skillGap: summary.skillGap, roadmap: summary.roadmap }, null, 1));
