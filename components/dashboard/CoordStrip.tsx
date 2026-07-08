// The instrument "coordinates" strip beneath the dial — labelled readouts like
// ELEV / WIND / WINDOW. Entries with no value are dropped; if nothing remains,
// the strip renders nothing.

export function CoordStrip({
  coords,
}: {
  coords: Array<[string, string | null]>;
}) {
  const shown = coords.filter(([, v]) => v);
  if (shown.length === 0) return null;

  return (
    <div className="coord">
      {shown.map(([k, v]) => (
        <span key={k}>
          {k} <b>{v}</b>
        </span>
      ))}
    </div>
  );
}
