import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  subjectiveFatigue,
  fatigueIndex,
  fatigueBand,
  generateTrainingPlan,
} from './analysis.js';

test('subjectiveFatigue inverts energy and sleep', () => {
  assert.equal(subjectiveFatigue([{ soreness: 5, stress: 5, energy: 1, sleepQuality: 1 }]), 100);
  assert.equal(subjectiveFatigue([{ soreness: 1, stress: 1, energy: 5, sleepQuality: 5 }]), 0);
  assert.equal(subjectiveFatigue([]), null);
});

test('fatigueIndex blends recovery + subjective and bands correctly', () => {
  const r = fatigueIndex({
    recoveryScore: 40,
    checkins: [{ soreness: 4, stress: 4, energy: 2, sleepQuality: 2 }],
    trainingLoadLatest: 300,
  });
  assert.ok(r.fatigue > 50, `expected elevated fatigue, got ${r.fatigue}`);
  assert.equal(r.band, fatigueBand(r.fatigue));
  assert.deepEqual(r.signalsUsed, ['recovery score', 'check-in ratings']);
});

test('fatigueIndex reports when no signals exist', () => {
  const r = fatigueIndex({ recoveryScore: null, checkins: [], trainingLoadLatest: null });
  assert.equal(r.signalsUsed.length, 0);
  assert.match(r.note, /log a check-in/i);
});

test('generate_plan is rest-led under very high fatigue', () => {
  const p = generateTrainingPlan({
    fatigue: 85,
    band: 'Very High',
    readinessLabel: 'Compromised',
    goals: [],
    days: 7,
  });
  assert.equal(p.days.length, 7);
  const rest = p.days.filter((d) => d.session === 'Rest' || d.session === 'Recovery').length;
  assert.ok(rest >= 4, `expected >=4 rest/recovery days, got ${rest}`);
});

test('generate_plan adds quality work when fresh', () => {
  const p = generateTrainingPlan({ fatigue: 15, band: 'Fresh', readinessLabel: 'Primed', goals: [], days: 7 });
  assert.ok(p.days.some((d) => d.session === 'Quality'));
});

test('generate_plan folds in a strength goal', () => {
  const p = generateTrainingPlan({
    fatigue: 40,
    band: 'Moderate',
    readinessLabel: 'Steady',
    goals: [{ title: 'Strength train 3x/week', category: 'strength', percent: 50 }],
    days: 7,
  });
  assert.ok(p.days.some((d) => d.session === 'Strength'));
  assert.ok(p.rationale.some((r) => /strength/i.test(r)));
});
