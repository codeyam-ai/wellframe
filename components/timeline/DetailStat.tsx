// A label/value pair in an entry detail's stat row (distance, pace, ...).
// Timeline-specific styling (wf-tl-dstat); the dashboard has its own Stat.

export function DetailStat({ k, val }: { k: string; val: string }) {
  return (
    <div className="wf-tl-dstat">
      <div className="k">{k}</div>
      <div className="val">{val}</div>
    </div>
  );
}
