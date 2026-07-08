// Plinth three-zone metadata bar: brand left, page subject center, timestamp +
// local-link status right. The signal "LOCAL LINK" dot reinforces the
// local-first, no-cloud posture from the product vision. A "Set Up" affordance
// on the right is the discoverable entry to the Connections panel.

export function Metabar({
  dateLabel,
  onOpenSetup,
}: {
  dateLabel: string;
  onOpenSetup?: () => void;
}) {
  return (
    <div className="wf-metabar">
      <div className="b">
        WELL<i>FRAME</i>
      </div>
      <div className="c">Daily Briefing · Console</div>
      <div className="r">
        <span>{dateLabel}</span>
        <span className="live">
          <span className="d" />
          LOCAL LINK
        </span>
        {onOpenSetup && (
          <button className="wf-setup" type="button" onClick={onOpenSetup}>
            Set Up
          </button>
        )}
      </div>
    </div>
  );
}
