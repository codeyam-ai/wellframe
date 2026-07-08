---
title: "Dashboard Design Pass + AI/Health Connections"
mode: ui
createdAt: "2026-07-08T16:10:57Z"
source: prototype
step: 11
---

# Dashboard Design Pass + AI/Health Connections

Prototyped a design-system alignment pass across all three dashboard surfaces
(primed/data, empty/onboarding, and a new Connections panel), plus a
discoverable, non-technical setup flow for connecting an AI coach and health
data providers.

## Design decisions

- **Plinth + one signal color.** Pulled the "deep-ink instrument" dashboard back
  toward the documented Plinth design system (`.codeyam/design/design_system.md`):
  monochrome discipline, with a single signal accent (blue `--wf-sig`) reserved
  for readiness (dial, score, `PRIMED` label), the `LOCAL LINK` status dot, and
  the primary CTA. The mint accent was retired everywhere (vitals bars → solid
  ink, field-log photo → true grayscale, section numerals → mute, field-log
  caption → mute).
- **Left-aligned, top-anchored.** Per the user's general (not universal)
  left-align preference: the readiness hero and the onboarding both anchor to the
  left edge and sit at the top of their column (removing the earlier
  vertically-centered "floating" gap under the section numeral).
- **Editorial serif kept.** Deliberately retained the New York serif for display
  (verdict, coach transmission, step/provider titles) rather than swapping to
  Manrope — it carries the product's character. Flagged as an easy future change
  if strict Plinth is wanted.
- **Dimensional buttons (deliberate departure).** At the user's request, buttons
  got a tactile 3D treatment (gradient body, inset highlight, drop shadow,
  hover-lift + press-down). This intentionally departs from Plinth's flat
  hairline-only rule; scoped to `.wf-btn` / `.wf-btn.p` / `.wf-setup`.
- **AI connect = both onboarding + settings.** First-run onboarding lives in the
  empty state; an always-available settings-style Connections panel is reachable
  from the metabar `⚙ SET UP` on the populated dashboard. Both routes open the
  same panel.
- **Non-technical connect flow.** No "API key" / "endpoint" language. Each AI
  provider's Connect expands a friendly 3-step "we open it in your browser, you
  sign in, done" flow. Providers: AI = Claude (local) / Gemini / OpenAI; Health =
  Apple Health / Garmin / Oura / Whoop.
- **Fresh vs. populated panel state.** The Connections panel takes a `fresh` prop
  (`fresh={!briefing}`): on day-one everything shows `CONNECT`; on the populated
  dashboard Claude shows `LOCAL · 0 CLOUD CALLS` and Apple Health `SYNCED`.

## Files touched

New components:
- `components/dashboard/InfoDisclosure.tsx` — reusable "what does this mean?"
  expand/collapse (used to de-jargon "Zone 2").
- `components/dashboard/ConnectionsPanel.tsx` — the AI + health-data setup dock,
  with the per-provider Connect flow and the `fresh` day-one variant.

Modified:
- `app/globals.css` — the bulk of the pass: monochrome/signal color discipline,
  left-aligned + top-anchored hero, dimensional button styles, disclosure styles,
  metabar `Set Up` affordance, Connections panel styles, and the rewritten
  left-aligned numbered-step onboarding (replacing the old centered empty state).
- `components/dashboard/DashboardConsole.tsx` — `setupOpen` state + `openSetup`,
  renders `ConnectionsPanel` with `fresh={!briefing}`, `initialSetupOpen`, passes
  `onOpenSetup` to `Metabar` and `EmptyBriefing`.
- `components/dashboard/Metabar.tsx` — added the `⚙ Set Up` entry (`onOpenSetup`).
- `components/dashboard/ReadinessHero.tsx` — added the Zone 2 `InfoDisclosure`
  explainer beneath the action buttons.
- `components/dashboard/EmptyBriefing.tsx` — rewritten as the left-aligned
  two-step first-run onboarding ("Connect your AI coach" / "Connect a health
  source") routing into the Connections panel.
- `app/page.tsx` — `?setup=1` deep link (alongside existing `?coach=1`) →
  `initialSetupOpen`.

## Scenarios exercised

No new scenarios registered; the pass was verified against existing application
scenarios:
- `dashboard-primed-briefing` — data / populated view.
- `dashboard-day-one-empty` — no-data / onboarding view.
- Connections panel verified open via `/?setup=1` in both populated (connected
  statuses) and fresh (all-disconnected) states.

Candidate new scenarios for the Build phase: a component scenario for
`ConnectionsPanel` (open, and fresh-open), a component scenario for
`InfoDisclosure` (expanded), and an application scenario capturing the setup
panel open state.

## Follow-ups / open threads

- Per-provider Connect currently ends at the friendly 3-step explainer; the real
  integration (OAuth browser flow vs. paste-key vs. mobile QR) is unbuilt.
- Serif → Manrope display swap remains available if stricter Plinth is desired.
- The dimensional buttons are a conscious exception to Plinth's flat rule.
