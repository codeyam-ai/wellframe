// Pure formatting helpers for the briefing console. No DB, fs, or secret
// imports — safe anywhere in the client bundle.

// Escape HTML, then turn *word* spans into <em>word</em>. Lets a briefing
// headline or coach message italicize one phrase (serif emphasis) while any
// author/seed-supplied markup stays inert. Escaping runs BEFORE emphasis so an
// injected tag cannot survive as live markup.
export function emphasize(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
}

// Clamp a track-fill percentage into the renderable [0, 100] range so a stray
// seed value can't overflow the bar; NaN degrades to 0.
export function clampPct(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
