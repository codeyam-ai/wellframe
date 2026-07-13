// The app's cross-surface navigation. Wellframe has no sidebar; the metabar's
// right zone carries these mono nav links so every console can switch to the
// others. Each surface filters out its own href before rendering. Kept as a
// plain data module (no DB, no client hooks) so it's safe to import from both
// server pages and client components.

export interface WfNavLink {
  label: string;
  href: string;
}

export const WF_NAV_LINKS: WfNavLink[] = [
  { label: 'Timeline', href: '/timeline' },
  { label: 'Trends', href: '/trends' },
  { label: 'Recovery', href: '/recovery' },
  { label: 'Goals', href: '/goals' },
  { label: 'Check-in', href: '/checkin' },
];
