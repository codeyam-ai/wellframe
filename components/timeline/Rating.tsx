// A 1-5 self-rating from a check-in, rendered as five ticks with the filled
// ones in signal ink. Renders nothing when the value is absent.

export function Rating({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="wf-tl-rating">
      <span className="k">{label}</span>
      <span className="ticks" aria-label={`${value} of 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={`tick${n <= value ? ' on' : ''}`} />
        ))}
      </span>
      <span className="v">{value}/5</span>
    </div>
  );
}
