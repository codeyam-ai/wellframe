// Plinth three-zone metadata bar: brand left, page subject center, timestamp +
// local-link status right. The mint "LOCAL LINK" dot reinforces the
// local-first, no-cloud posture from the product vision.

export function Metabar({ dateLabel }: { dateLabel: string }) {
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
      </div>
    </div>
  );
}
