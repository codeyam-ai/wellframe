// The coach entry point. In this first build the coach is a stub: the ⌘K
// shortcut and the "Query coach" button both open a quiet panel confirming the
// entry point works, ahead of the full context-aware coach in a later feature.
'use client';

export function CoachDock({ open, onClose = () => {} }: { open: boolean; onClose?: () => void }) {
  if (!open) return null;
  return (
    <div className="wf-dock-scrim" role="dialog" aria-modal="true" aria-label="Coach" onClick={onClose}>
      <aside className="wf-dock" onClick={(e) => e.stopPropagation()}>
        <div className="wf-dock-head">
          <span className="wf-secnum">Coach · Console</span>
          <button className="wf-dock-x" type="button" aria-label="Close coach" onClick={onClose}>
            ✕
          </button>
        </div>
        <blockquote className="wf-dock-msg">
          The coach is warming up.
        </blockquote>
        <p className="wf-dock-body">
          Soon you'll ask it anything ("Am I overtraining?", "Prepare me for my trail
          race") and it will read your local history to answer. Nothing leaves this
          machine without your say-so.
        </p>
        <div className="wf-dock-sig">// local model · standing by · 0 cloud calls</div>
      </aside>
    </div>
  );
}
