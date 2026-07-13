// The Recovery Center surface. Left: a recovery-score instrument (RecoveryHero).
// Right: contributing factors and suggested actions, each a row that expands to
// reveal a plain-language read — the page's primary interaction. Client
// component: owns which factor/action rows are open. Day-one (no read) shows the
// empty state.
'use client';

import { useState } from 'react';
import { Metabar } from '@/components/dashboard/Metabar';
import { WF_NAV_LINKS } from '@/components/dashboard/nav';
import { RecoveryEmpty } from './RecoveryEmpty';
import { RecoveryHero } from './RecoveryHero';
import { RecoveryFactorRow } from './RecoveryFactorRow';
import { RecoveryActionRow } from './RecoveryActionRow';
import type { RecoveryReadFull } from '@/app/lib/recovery';

export function RecoveryConsole({
  recovery,
  dateLabel,
  initialFactorPos,
  initialActionPos,
}: {
  recovery: RecoveryReadFull;
  dateLabel: string;
  // 1-based position of a factor / action row to open on first render (?factor=
  // / ?action= deep links, or a scenario that captures an expanded row).
  initialFactorPos?: number;
  initialActionPos?: number;
}) {
  // Resolve the 1-based position deep-links to the actual row ids up front.
  const initialFactorId =
    initialFactorPos && recovery
      ? (recovery.factors[initialFactorPos - 1]?.id ?? null)
      : null;
  const initialActionId =
    initialActionPos && recovery
      ? (recovery.actions[initialActionPos - 1]?.id ?? null)
      : null;
  const [openFactor, setOpenFactor] = useState<number | null>(initialFactorId);
  const [openAction, setOpenAction] = useState<number | null>(initialActionId);

  const navLinks = WF_NAV_LINKS.filter((l) => l.href !== '/recovery');

  if (!recovery || recovery.score === null) {
    return (
      <div className="wf">
        <Metabar dateLabel={dateLabel} subject="Recovery · Center" navLinks={navLinks} />
        <RecoveryEmpty />
      </div>
    );
  }

  return (
    <div className="wf">
      <Metabar dateLabel={dateLabel} subject="Recovery · Center" navLinks={navLinks} />

      <div className="wf-deck">
        <RecoveryHero
          score={recovery.score}
          label={recovery.label}
          headline={recovery.headline}
          summary={recovery.summary}
          statusLine={recovery.statusLine}
          factors={recovery.factors}
        />

        <section className="wf-info">
          <div className="wf-block">
            <div className="wf-secnum">
              <span className="n">02 /</span> Contributing Signals
            </div>
            <div className="wf-rec-factors">
              {recovery.factors.map((f) => (
                <RecoveryFactorRow
                  key={f.id}
                  factor={f}
                  open={openFactor === f.id}
                  onToggle={() => setOpenFactor(openFactor === f.id ? null : f.id)}
                />
              ))}
            </div>
          </div>

          <div className="wf-block">
            <div className="wf-secnum">
              <span className="n">03 /</span> Suggested Recovery
            </div>
            <div className="wf-rec-actions">
              {recovery.actions.map((a) => (
                <RecoveryActionRow
                  key={a.id}
                  action={a}
                  open={openAction === a.id}
                  onToggle={() => setOpenAction(openAction === a.id ? null : a.id)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecoveryConsole;
