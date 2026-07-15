// Cross-surface navigation. Wellframe has no sidebar; the metabar's right zone
// carries these mono nav links so every console can switch to the others. In
// the desktop app these will drive the in-app router once the other consoles
// are ported — for now they name the surfaces.

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
