// A quiet, in-place "expand for the plain-language version" affordance. Plinth
// discipline: a mono bracket toggle, no chevron chrome, content revealed below
// a hairline. Used to de-jargon the readiness directive ("what is Zone 2?").
'use client';

import { useId, useState } from 'react';

export function InfoDisclosure({
  label = 'What does this mean?',
  openLabel = 'Hide',
  children,
}: {
  label?: string;
  openLabel?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  return (
    <div className={`wf-disclosure${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="wf-disclosure-toggle"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? openLabel : label}
      </button>
      {open && (
        <div className="wf-disclosure-body" id={bodyId}>
          {children}
        </div>
      )}
    </div>
  );
}
