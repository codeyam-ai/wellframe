// The daily check-in form: a morning/evening toggle, a mood word, four 1-5
// rating scales, and a reflection note. Submitting is the surface's primary
// interaction — it writes a Mood row (that also lands on the Timeline) and, on
// success, resets the form and asks the parent to refresh. Owns the form field +
// pending/error state.

import { useState } from 'react';
import { RatingScale } from './RatingScale';
import {
  PARTS_OF_DAY,
  RATING_FIELDS,
  validateCheckinInput,
  type PartOfDay,
  type RatingField,
} from './checkin';
import { submitCheckin } from './data';

const RATING_LABELS: Record<RatingField, string> = {
  energy: 'Energy',
  sleepQuality: 'Sleep',
  soreness: 'Soreness',
  stress: 'Stress',
};

type Ratings = Record<RatingField, number | null>;
const EMPTY_RATINGS: Ratings = {
  energy: null,
  sleepQuality: null,
  soreness: null,
  stress: null,
};

export function CheckinForm({
  partOfDay,
  onPartOfDay,
  onLogged,
}: {
  partOfDay: PartOfDay;
  onPartOfDay: (part: PartOfDay) => void;
  onLogged: () => void;
}) {
  const [ratings, setRatings] = useState<Ratings>(EMPTY_RATINGS);
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setRating(field: RatingField, value: number) {
    setRatings((r) => ({ ...r, [field]: r[field] === value ? null : value }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const validated = validateCheckinInput({
      partOfDay,
      occurredAt: new Date().toISOString(),
      energy: ratings.energy,
      mood,
      sleepQuality: ratings.sleepQuality,
      soreness: ratings.soreness,
      stress: ratings.stress,
      note,
    });
    if (!validated.ok) {
      setError(validated.error);
      return;
    }
    setPending(true);
    const res = await submitCheckin(validated.value);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? 'Could not log the check-in.');
      return;
    }
    setRatings(EMPTY_RATINGS);
    setMood('');
    setNote('');
    onLogged();
  }

  return (
    <form className="wf-ci-form" onSubmit={onSubmit}>
      <div className="wf-ci-part">
        {PARTS_OF_DAY.map((p) => (
          <button
            key={p}
            type="button"
            className={`wf-tl-chip${p === partOfDay ? ' is-active' : ''}`}
            onClick={() => onPartOfDay(p)}
            aria-pressed={p === partOfDay}
          >
            {p === 'morning' ? 'Morning' : 'Evening'}
          </button>
        ))}
      </div>

      <label className="wf-field">
        <span className="wf-field-k">Mood, in a word</span>
        <input
          className="wf-input"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Steady"
          maxLength={24}
        />
      </label>

      <div className="wf-ci-ratings">
        {RATING_FIELDS.map((field) => (
          <RatingScale
            key={field}
            label={RATING_LABELS[field]}
            value={ratings[field]}
            onSet={(n) => setRating(field, n)}
          />
        ))}
      </div>

      <label className="wf-field">
        <span className="wf-field-k">
          {partOfDay === 'morning' ? 'Intention' : 'Reflection'}
        </span>
        <textarea
          className="wf-input wf-textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            partOfDay === 'morning'
              ? 'What matters today?'
              : 'Wins, challenges, how the day landed…'
          }
          rows={3}
        />
      </label>

      {error && <div className="wf-method-err">{error}</div>}

      <div className="wf-method-actions">
        <button type="submit" className="wf-btn p" disabled={pending}>
          {pending ? 'Logging…' : 'Log check-in'}
        </button>
      </div>
    </form>
  );
}
