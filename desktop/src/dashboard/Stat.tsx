// Presentational label/value pair used inside the Field Log stats row.

export function Stat({ k, val }: { k: string; val: string }) {
  return (
    <div className="s">
      <div className="k">{k}</div>
      <div className="val">{val}</div>
    </div>
  );
}
