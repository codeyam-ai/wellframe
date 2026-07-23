// Pure fatigue + training-plan logic. No I/O, so it's unit-testable and the MCP
// tools stay thin (gather data → call these → return). Heuristics, not medical
// advice: a transparent composite the coaching model can reason over and adjust.

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function avg(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}
// Map a 1–5 self-rating to 0–100.
function scale1to5(v: number): number {
  return (clamp(v, 1, 5) - 1) / 4 * 100;
}

export interface CheckinRatings {
  energy?: number | null;
  soreness?: number | null;
  stress?: number | null;
  sleepQuality?: number | null;
}

// A raw `mood` row as the DB returns it (snake_case). Kept here so the
// snake→camel remap that feeds the fatigue math is a tested pure function
// rather than inline logic in the DB-gathering layer.
export interface CheckinRow {
  energy?: number | null;
  soreness?: number | null;
  stress?: number | null;
  sleep_quality?: number | null;
}

// Remap DB check-in rows to the CheckinRatings shape the fatigue math expects
// (notably sleep_quality → sleepQuality).
export function toCheckinRatings(rows: CheckinRow[]): CheckinRatings[] {
  return rows.map((r) => ({
    energy: r.energy,
    soreness: r.soreness,
    stress: r.stress,
    sleepQuality: r.sleep_quality,
  }));
}

// Pull the leading numeric value out of a trend metric's `latest` string (e.g.
// "62", "7.4 h", "1,240"). Returns null for absent, non-numeric, or zero-valued
// input so downstream fatigue math treats "no signal" and "0" alike.
export function parseMetricNumber(latest: string | null | undefined): number | null {
  if (latest == null) return null;
  return Number(String(latest).replace(/[^0-9.]/g, '')) || null;
}

// Subjective fatigue 0–100 from recent check-ins. Soreness + stress read
// directly; energy + sleep are inverted (more energy / better sleep → less
// fatigue). Averages the present fields per check-in, then across check-ins.
// Returns null when nothing was rated.
export function subjectiveFatigue(checkins: CheckinRatings[]): number | null {
  const perDay: number[] = [];
  for (const c of checkins) {
    const vals: number[] = [];
    if (c.soreness != null) vals.push(scale1to5(c.soreness));
    if (c.stress != null) vals.push(scale1to5(c.stress));
    if (c.energy != null) vals.push(100 - scale1to5(c.energy));
    if (c.sleepQuality != null) vals.push(100 - scale1to5(c.sleepQuality));
    if (vals.length) perDay.push(avg(vals));
  }
  return perDay.length ? Math.round(avg(perDay)) : null;
}

export type FatigueBand = 'Fresh' | 'Moderate' | 'High' | 'Very High';
export function fatigueBand(f: number): FatigueBand {
  if (f < 25) return 'Fresh';
  if (f < 50) return 'Moderate';
  if (f < 75) return 'High';
  return 'Very High';
}

export interface FatigueInputs {
  recoveryScore: number | null; // 0–100 (higher = more recovered)
  checkins: CheckinRatings[];
  trainingLoadLatest?: number | null; // context only
}
export interface FatigueResult {
  fatigue: number;
  band: FatigueBand;
  components: { recovery: number | null; subjective: number | null };
  signalsUsed: string[];
  note: string;
}

// Composite fatigue 0–100. Objective recovery (inverted recovery score) and
// subjective check-in fatigue are blended by weight; whichever are present are
// used. No signals → 50 with a note, so the coach knows to ask for a check-in.
export function fatigueIndex(inp: FatigueInputs): FatigueResult {
  const subjective = subjectiveFatigue(inp.checkins);
  const recovery = inp.recoveryScore != null ? clamp(100 - inp.recoveryScore, 0, 100) : null;

  const parts: { v: number; w: number }[] = [];
  const signalsUsed: string[] = [];
  if (recovery != null) {
    parts.push({ v: recovery, w: 0.55 });
    signalsUsed.push('recovery score');
  }
  if (subjective != null) {
    parts.push({ v: subjective, w: 0.45 });
    signalsUsed.push('check-in ratings');
  }

  const fatigue = parts.length
    ? Math.round(parts.reduce((a, b) => a + b.v * b.w, 0) / parts.reduce((a, b) => a + b.w, 0))
    : 50;
  const note = parts.length
    ? `Composite of ${signalsUsed.join(' + ')}${inp.trainingLoadLatest != null ? ` (training load ${inp.trainingLoadLatest} for context)` : ''}.`
    : 'No recovery read or check-ins yet — log a check-in for a real estimate.';

  return { fatigue, band: fatigueBand(fatigue), components: { recovery, subjective }, signalsUsed, note };
}

// ── Plan generation ─────────────────────────────────────────────────────────

export interface PlanGoal {
  title: string;
  category: string;
  percent: number | null;
}
export type SessionType = 'Rest' | 'Recovery' | 'Easy' | 'Quality' | 'Long' | 'Strength';
export interface PlanDay {
  day: number;
  session: SessionType;
  focus: string;
}
export interface PlanInputs {
  fatigue: number;
  band: FatigueBand;
  readinessLabel: string | null;
  goals: PlanGoal[];
  days: number;
}
export interface Plan {
  horizonDays: number;
  summary: string;
  rationale: string[];
  days: PlanDay[];
}

const FOCUS: Record<SessionType, string> = {
  Rest: 'Full rest',
  Recovery: '20–30 min easy movement / mobility',
  Easy: 'Zone 2, conversational',
  Quality: 'Intervals or tempo at target effort',
  Long: 'Extended aerobic session',
  Strength: 'Full-body strength',
};

// Build a day-by-day plan. A weekly rotation is chosen by fatigue band (harder
// when fresh, rest-led when very fatigued), softened by a compromised readiness
// label, then goal-aware tweaks fold in strength work and note where volume /
// sleep needs attention.
export function generateTrainingPlan(inp: PlanInputs): Plan {
  const days = clamp(Math.round(inp.days), 1, 28);
  const rationale: string[] = [];

  let rotation: SessionType[];
  switch (inp.band) {
    case 'Very High':
      rotation = ['Rest', 'Recovery', 'Easy', 'Rest', 'Recovery', 'Easy', 'Rest'];
      rationale.push('Very high fatigue → rest-led week to shed load before the next block.');
      break;
    case 'High':
      rotation = ['Recovery', 'Easy', 'Rest', 'Easy', 'Recovery', 'Easy', 'Rest'];
      rationale.push('High fatigue → easy/recovery emphasis, no quality work this week.');
      break;
    case 'Moderate':
      rotation = ['Easy', 'Quality', 'Easy', 'Rest', 'Easy', 'Long', 'Recovery'];
      rationale.push('Moderate fatigue → standard build: one quality day, one long, one rest.');
      break;
    default:
      rotation = ['Quality', 'Easy', 'Long', 'Recovery', 'Quality', 'Easy', 'Rest'];
      rationale.push('Fresh → two quality days plus a long session.');
  }

  if (inp.readinessLabel && /compromis|strain|low|tired/i.test(inp.readinessLabel)) {
    rotation = [...rotation];
    rotation[0] = 'Recovery';
    rationale.push(`Readiness "${inp.readinessLabel}" → today softened to recovery.`);
  }

  const strengthGoal = inp.goals.find((g) => /strength/i.test(g.category));
  if (strengthGoal) rationale.push(`Goal "${strengthGoal.title}" → strength sessions folded into easy days.`);
  const behindVolume = inp.goals.find(
    (g) => /(distance|race)/i.test(g.category) && (g.percent ?? 100) < 60,
  );
  if (behindVolume) rationale.push(`Behind on "${behindVolume.title}" → bias volume up on easy/long days.`);
  const sleepBehind = inp.goals.find((g) => /sleep/i.test(g.category) && (g.percent ?? 100) < 80);
  if (sleepBehind) rationale.push('Sleep goal behind → protect sleep; keep intensity conservative.');

  const planDays: PlanDay[] = [];
  let easySeen = 0;
  for (let d = 0; d < days; d++) {
    let s = rotation[d % rotation.length];
    // With a strength goal, turn every second easy day into a strength session.
    if (strengthGoal && s === 'Easy' && ++easySeen % 2 === 0) s = 'Strength';
    planDays.push({ day: d + 1, session: s, focus: FOCUS[s] });
  }

  const summary =
    `${days}-day plan · fatigue ${inp.fatigue}/100 (${inp.band})` +
    (inp.readinessLabel ? ` · readiness ${inp.readinessLabel}` : '');
  return { horizonDays: days, summary, rationale, days: planDays };
}
