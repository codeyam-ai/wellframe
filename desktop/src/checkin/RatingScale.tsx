// One 1-5 rating row in the check-in form: a label, five toggle ticks, and the
// word for the current value. Clicking a tick sets the rating; clicking the
// active value clears it (handled by the parent). Reused for energy, sleep,
// soreness, and stress. Pure presentational.

import { ratingLabel } from './checkin';

export function RatingScale({
  label,
  value,
  onSet,
}: {
  label: string;
  value: number | null;
  onSet: (value: number) => void;
}) {
  return (
    <div className="wf-ci-rating">
      <span className="wf-ci-rk">{label}</span>
      <div className="wf-ci-ticks" role="group" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`wf-ci-tick${value !== null && n <= value ? ' on' : ''}`}
            onClick={() => onSet(n)}
            aria-label={`${label} ${n}`}
            aria-pressed={value === n}
          />
        ))}
      </div>
      <span className="wf-ci-rv">{ratingLabel(value)}</span>
    </div>
  );
}
