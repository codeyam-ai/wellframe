// Plinth three-zone metadata bar: brand left, page subject center, timestamp +
// local-link status right. The signal "LOCAL LINK" dot reinforces the
// local-first, no-cloud posture from the product vision. A "Set Up" affordance
// on the right is the discoverable entry to the Connections panel. The brand
// links home so every surface can return to the dashboard, and `subject` names
// the current surface in the center zone.

import Link from 'next/link';

export function Metabar({
  dateLabel,
  subject = 'Daily Briefing · Console',
  navLinks,
  onOpenSetup,
}: {
  dateLabel: string;
  subject?: string;
  // Cross-surface mono nav links shown in the right zone (e.g. Dashboard →
  // Timeline). The app has no sidebar; these are the surface switchers.
  navLinks?: { label: string; href: string }[];
  onOpenSetup?: () => void;
}) {
  return (
    <div className="wf-metabar">
      <Link href="/" className="b">
        WELL<i>FRAME</i>
      </Link>
      <div className="c">{subject}</div>
      <div className="r">
        {navLinks?.map((link) => (
          <Link key={link.href} href={link.href} className="wf-nav-link">
            {link.label}
          </Link>
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
