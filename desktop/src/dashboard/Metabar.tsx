// Plinth three-zone metadata bar: brand left, page subject center, timestamp +
// local-link status right. The signal "LOCAL LINK" dot reinforces the
// local-first, no-cloud posture. A "Set Up" affordance on the right is the
// discoverable entry to the Connections panel.
//
// Ported from the web app's next/link version to plain anchors — the desktop
// app's in-app router lands when the other consoles are ported, at which point
// these become router navigations rather than hrefs.

export function Metabar({
  dateLabel,
  subject = 'Daily Briefing · Console',
  navLinks,
  onOpenSetup,
}: {
  dateLabel: string;
  subject?: string;
  navLinks?: { label: string; href: string }[];
  onOpenSetup?: () => void;
}) {
  return (
    <div className="wf-metabar">
      <a href="/" className="b">
        WELL<i>FRAME</i>
      </a>
      <div className="c">{subject}</div>
      <div className="r">
        {navLinks?.map((link) => (
          <a key={link.href} href={link.href} className="wf-nav-link">
            {link.label}
          </a>
        ))}
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
