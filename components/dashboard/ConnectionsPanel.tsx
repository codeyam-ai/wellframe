// The "Set Up" surface, reachable from the metabar on the populated dashboard.
// Two plain-language sections: the AI coach (Claude / Gemini / OpenAI) and
// health-data sources. Deliberately non-technical — no "API key", no "endpoint".
// Owns the dock chrome and the active-connect-flow state; each provider group
// is a ConnectionsGroup.
'use client';

import { useState } from 'react';
import { AI_PROVIDERS, HEALTH_SOURCES, asFresh } from './connections';
import { ConnectionsGroup } from './ConnectionsGroup';

export function ConnectionsPanel({
  open,
  onClose = () => {},
  // Day-one: nothing is connected yet, so show every provider as available to
  // connect rather than inheriting the populated demo's connected statuses.
  fresh = false,
}: {
  open: boolean;
  onClose?: () => void;
  fresh?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  if (!open) return null;

  const aiProviders = asFresh(AI_PROVIDERS, fresh);
  const healthSources = asFresh(HEALTH_SOURCES, fresh);

  const toggle = (id: string) => setActiveId((cur) => (cur === id ? null : id));
  const clearActive = () => setActiveId(null);

  return (
    <div
      className="wf-dock-scrim"
      role="dialog"
      aria-modal="true"
      aria-label="Connections and setup"
      onClick={onClose}
    >
      <aside className="wf-dock wf-dock-wide" onClick={(e) => e.stopPropagation()}>
        <div className="wf-dock-head">
          <span className="wf-secnum">Connections · Setup</span>
          <button className="wf-dock-x" type="button" aria-label="Close setup" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="wf-conn-scroll">
          <ConnectionsGroup
            title="Your AI coach"
            lead="Your coach is powered by an AI model. Pick the one you trust. You can switch anytime."
            providers={aiProviders}
            interactive
            activeId={activeId}
            onToggle={toggle}
            onContinue={clearActive}
          />
          <ConnectionsGroup
            title="Health data"
            lead="Wellframe reads your health data to build each briefing. It stays on this machine."
            providers={healthSources}
          />
        </div>

        <div className="wf-dock-sig">// nothing is shared without your say-so</div>
      </aside>
    </div>
  );
}
