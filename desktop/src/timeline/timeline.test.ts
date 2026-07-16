import { describe, it, expect } from 'vitest';
import {
  dayKey,
  relativeDayLabel,
  timeLabel,
  groupByDay,
  entryMatchesFilter,
  parseEntryId,
  workoutSummary,
  moodSummary,
  weightSummary,
  deriveChips,
  buildTimeline,
  briefingOccurredAt,
  type TimelineDay,
  type TimelineEntry,
} from './timeline';
import type { DailyBriefing, Mood, Weight, Workout } from './models';

function entry(over: Partial<TimelineEntry> & { id: string; occurredAt: string }): TimelineEntry {
  return {
    kind: 'workout',
    dbId: 1,
    title: 'Untitled',
    summary: '',
    filterKey: 'run',
    ...over,
  };
}

describe('dayKey', () => {
  // takes the UTC calendar date (YYYY-MM-DD) from an ISO datetime
  it('takes the UTC calendar date from an ISO datetime', () => {
    expect(dayKey('2026-07-06T07:14:00Z')).toBe('2026-07-06');
  });
});

describe('relativeDayLabel', () => {
  const newest = '2026-07-06T09:00:00Z';
  // the newest day in the set reads as Today
  it('labels the newest day Today', () => {
    expect(relativeDayLabel('2026-07-06T07:00:00Z', newest)).toBe('Today');
  });
  // the day before the newest reads as Yesterday
  it('labels the prior day Yesterday', () => {
    expect(relativeDayLabel('2026-07-05T22:00:00Z', newest)).toBe('Yesterday');
  });
  // older days read as weekday + month + date
  it('labels older days with weekday + month + date', () => {
    expect(relativeDayLabel('2026-07-02T06:00:00Z', newest)).toBe('Thu Jul 2');
  });
  // an entry later on the newest day still reads Today, never a future label
  it('never returns a negative-diff label for entries after the reference', () => {
    // A same-day-but-later entry still reads Today, not a future label.
    expect(relativeDayLabel('2026-07-06T23:00:00Z', newest)).toBe('Today');
  });
});

describe('timeLabel', () => {
  // extracts the HH:MM portion of an ISO datetime
  it('extracts HH:MM', () => {
    expect(timeLabel('2026-07-06T07:14:00Z')).toBe('07:14');
  });
});

describe('groupByDay', () => {
  // no entries yields no day groups
  it('returns empty for no entries', () => {
    expect(groupByDay([])).toEqual([]);
  });
  // entries are grouped into newest-first days with relative labels
  it('groups entries into newest-first days with relative labels', () => {
    const days = groupByDay([
      entry({ id: 'workout-1', occurredAt: '2026-07-04T08:00:00Z' }),
      entry({ id: 'workout-2', occurredAt: '2026-07-06T07:00:00Z' }),
      entry({ id: 'mood-1', kind: 'mood', occurredAt: '2026-07-06T21:00:00Z' }),
    ]);
    expect(days.map((d) => d.dateLabel)).toEqual(['Today', 'Sat Jul 4']);
    // Within the newest day, the 21:00 entry sorts before the 07:00 one.
    expect(days[0].entries.map((e) => e.id)).toEqual(['mood-1', 'workout-2']);
  });
});

describe('entryMatchesFilter', () => {
  const run = entry({ id: 'workout-1', occurredAt: '2026-07-06T07:00:00Z', title: 'Ridgeline Trail Run', summary: '8.2 mi', filterKey: 'run', accent: 'Z2' });
  // an empty or 'all' type matches every entry
  it('passes everything when type is empty or all', () => {
    expect(entryMatchesFilter(run, {})).toBe(true);
    expect(entryMatchesFilter(run, { type: 'all' })).toBe(true);
  });
  // a type chip matches only entries with that filterKey
  it('filters by the entry filterKey', () => {
    expect(entryMatchesFilter(run, { type: 'run' })).toBe(true);
    expect(entryMatchesFilter(run, { type: 'ride' })).toBe(false);
  });
  // the query matches title, summary, and accent case-insensitively
  it('matches the query across title, summary, and accent case-insensitively', () => {
    expect(entryMatchesFilter(run, { q: 'trail' })).toBe(true);
    expect(entryMatchesFilter(run, { q: '8.2' })).toBe(true);
    expect(entryMatchesFilter(run, { q: 'z2' })).toBe(true);
    expect(entryMatchesFilter(run, { q: 'swim' })).toBe(false);
  });
  // the type chip and the query must both pass
  it('ANDs the type and query', () => {
    expect(entryMatchesFilter(run, { type: 'run', q: 'trail' })).toBe(true);
    expect(entryMatchesFilter(run, { type: 'ride', q: 'trail' })).toBe(false);
  });
});

describe('parseEntryId', () => {
  // a well-formed id splits into kind and numeric db id
  it('splits kind and numeric id', () => {
    expect(parseEntryId('workout-3')).toEqual({ kind: 'workout', dbId: 3 });
    expect(parseEntryId('mood-12')).toEqual({ kind: 'mood', dbId: 12 });
  });
  // malformed ids (no kind, unknown kind, non-positive/non-numeric id) return null
  it('rejects malformed ids', () => {
    expect(parseEntryId('workout')).toBeNull();
    expect(parseEntryId('bogus-1')).toBeNull();
    expect(parseEntryId('workout-0')).toBeNull();
    expect(parseEntryId('workout-x')).toBeNull();
    expect(parseEntryId('-1')).toBeNull();
  });
});

describe('summary builders', () => {
  // a workout summary joins present stats with a middle dot, skipping missing ones
  it('joins present workout stats, skipping missing ones', () => {
    expect(workoutSummary({ distance: '8.2 mi', pace: '8:42', vertical: '1,240 ft', duration: '1:12:40' }))
      .toBe('8.2 mi · 8:42 · 1,240 ft · 1:12:40');
    expect(workoutSummary({ distance: null, pace: null, vertical: null, duration: '38:20' }))
      .toBe('38:20');
  });
  // a mood summary is built from the present energy / mood / note fields
  it('builds a mood summary from present fields', () => {
    expect(moodSummary({ energy: 4, mood: 'Steady', note: 'Slept well' }))
      .toBe('Energy 4 · Steady · Slept well');
    expect(moodSummary({ energy: null, mood: 'Flat', note: null })).toBe('Flat');
  });
  // a weight summary appends the trend delta only when it is present
  it('appends the weight delta only when present', () => {
    expect(weightSummary({ value: '154.2', unit: 'lb', delta: '▼0.4' })).toBe('154.2 lb · ▼0.4');
    expect(weightSummary({ value: '154.6', unit: 'lb', delta: null })).toBe('154.6 lb');
  });
});

describe('deriveChips', () => {
  function dayWith(filterKeys: string[]): TimelineDay {
    return {
      key: '2026-07-06',
      dateLabel: 'Today',
      entries: filterKeys.map((fk, i) =>
        entry({ id: `${fk}-${i}`, occurredAt: '2026-07-06T07:00:00Z', filterKey: fk }),
      ),
    };
  }

  // always leads with an All chip even when there is no data
  it('returns just the All chip for empty data', () => {
    expect(deriveChips([])).toEqual([{ filterKey: 'all', label: 'All' }]);
  });

  // only kinds present in the data get chips, in canonical order
  it('derives chips from present kinds in CHIP_ORDER order', () => {
    const chips = deriveChips([dayWith(['weight', 'run', 'briefing'])]);
    expect(chips.map((c) => c.filterKey)).toEqual(['all', 'run', 'briefing', 'weight']);
    expect(chips.find((c) => c.filterKey === 'run')?.label).toBe('Runs');
  });

  // a duplicate kind across entries produces a single chip
  it('dedupes repeated kinds', () => {
    const chips = deriveChips([dayWith(['run', 'run', 'run'])]);
    expect(chips.map((c) => c.filterKey)).toEqual(['all', 'run']);
  });

  // an unknown filterKey still gets a chip (labeled by its key) so it is reachable
  it('appends chips for unexpected kinds so nothing is unreachable', () => {
    const chips = deriveChips([dayWith(['run', 'swim'])]);
    expect(chips.map((c) => c.filterKey)).toEqual(['all', 'run', 'swim']);
    expect(chips.find((c) => c.filterKey === 'swim')?.label).toBe('swim');
  });
});

describe('briefingOccurredAt', () => {
  // a bare date is placed at 07:00 so it sorts among morning entries
  it('appends a morning time to a bare date', () => {
    expect(briefingOccurredAt('2026-07-06')).toBe('2026-07-06T07:00:00Z');
  });
  // a full ISO datetime is passed through unchanged
  it('leaves a full datetime untouched', () => {
    expect(briefingOccurredAt('2026-07-06T09:15:00Z')).toBe('2026-07-06T09:15:00Z');
  });
});

describe('buildTimeline', () => {
  const workout = (over: Partial<Workout> & { id: number }): Workout => ({
    title: 'Run', typeLabel: null, photoUrl: null, distance: null, pace: null,
    vertical: null, duration: null, occurredAt: null, kind: null, ...over,
  });
  const mood = (over: Partial<Mood> & { id: number }): Mood => ({
    occurredAt: '2026-07-06T06:00:00Z', partOfDay: 'morning', energy: null, mood: null,
    sleepQuality: null, soreness: null, stress: null, note: null, ...over,
  });
  const weight = (over: Partial<Weight> & { id: number }): Weight => ({
    occurredAt: '2026-07-06T06:30:00Z', value: '154.0', unit: 'lb', delta: null, positive: false, ...over,
  });
  const empty = { workouts: [], briefings: [], moods: [], weights: [] };

  // no rows yields no days (the production day-one state)
  it('returns an empty array for empty sources', () => {
    expect(buildTimeline(empty)).toEqual([]);
  });

  // a workout without occurredAt cannot be placed on the timeline and is skipped
  it('skips workouts that have no occurredAt', () => {
    const days = buildTimeline({
      ...empty,
      workouts: [workout({ id: 1, occurredAt: null }), workout({ id: 2, occurredAt: '2026-07-06T07:00:00Z', kind: 'run' })],
    });
    const ids = days.flatMap((d) => d.entries.map((e) => e.id));
    expect(ids).toEqual(['workout-2']);
  });

  // each source kind is normalized with a composite id, filterKey, and summary
  it('normalizes all four source kinds into grouped entries', () => {
    const days = buildTimeline({
      workouts: [workout({ id: 1, occurredAt: '2026-07-06T07:14:00Z', kind: 'run', distance: '4.6 mi' })],
      briefings: [{
        id: 1, date: '2026-07-06', dateLabel: '', readinessScore: 82, readinessLabel: 'Primed',
        readinessDelta: 4, headline: 'Cleared', statusLine: 'PRIMED', elevation: null, wind: null,
        windowLabel: null, suggestedWorkout: null, coachMessage: null, coachDirective: null, coachSignature: null,
      } as DailyBriefing],
      moods: [mood({ id: 1, occurredAt: '2026-07-06T06:50:00Z', mood: 'Steady', energy: 4 })],
      weights: [weight({ id: 1, occurredAt: '2026-07-06T06:40:00Z', value: '154.2', delta: '▼0.4' })],
    });
    const entries = days.flatMap((d) => d.entries);
    const byId = Object.fromEntries(entries.map((e) => [e.id, e]));
    expect(byId['workout-1'].filterKey).toBe('run');
    expect(byId['workout-1'].summary).toBe('4.6 mi');
    expect(byId['briefing-1'].accent).toBe('Readiness 82');
    expect(byId['mood-1'].title).toBe('Morning check-in');
    expect(byId['weight-1'].summary).toBe('154.2 lb · ▼0.4');
  });

  // entries across days land in newest-first day groups
  it('groups entries into newest-first days', () => {
    const days = buildTimeline({
      ...empty,
      moods: [mood({ id: 1, occurredAt: '2026-07-04T06:00:00Z' }), mood({ id: 2, occurredAt: '2026-07-06T06:00:00Z' })],
    });
    expect(days.map((d) => d.dateLabel)).toEqual(['Today', 'Sat Jul 4']);
  });
});
