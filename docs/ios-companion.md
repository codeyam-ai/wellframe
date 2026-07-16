# iOS Companion — separate track (scoping, not yet built)

The desktop app (macOS/Windows/Linux) + the MCP coach are the current focus. The
iOS companion is a **separate track** with its own toolchain, signing, distribution,
and — the hard part — a **data-sync design**. This document scopes it; nothing here
is built.

## Why it exists (the PRD's "lightweight iOS companion")

Its primary job is **Apple Health (HealthKit) import** — the desktop app can't read
HealthKit (that's iOS-only), so a phone app is the only way to get steps, sleep,
heart rate, resting HR, HRV, VO2 Max, workouts, etc. into Wellframe. Secondary jobs:
a quick daily check-in and a glanceable readiness view on the phone.

It is **not** a port of the whole desktop app. Keep it thin: read HealthKit, capture
a check-in, sync to the desktop.

## Why it's a separate track (not "just another target")

| Axis | Desktop (built) | iOS companion |
|---|---|---|
| Toolchain | Tauri + Rust + Vite | Xcode; Swift or a mobile web-shell |
| Signing | **Developer ID** (outside App Store) | **Apple Distribution** + provisioning profiles |
| Distribution | GitHub Releases / direct download | **App Store / TestFlight** (review required) |
| Key capability | local SQLite | **HealthKit** entitlement + privacy review |
| UI | 6 desktop consoles | 2–3 thin phone screens |

Same Apple Developer account (support@codeyam.com) covers both, but the **cert types
differ** — Developer ID for the Mac desktop build vs. Apple Distribution + an App ID
and provisioning profile for iOS.

## Tech options (pick when this track starts)

1. **Native SwiftUI** — cleanest HealthKit integration, most idiomatic, App Store–ready.
   Separate codebase; no UI reuse. *Recommended if HealthKit fidelity matters most.*
2. **Capacitor + the existing React** — reuses the desktop UI; HealthKit via a community
   plugin. codeyam even ships a `capacitor-vite-react` stack. *Recommended to reuse UI.*
3. **Tauri v2 mobile (iOS)** — reuses the React UI, but HealthKit needs a custom Swift
   plugin; least mature path for health data today.

## The real design question: sync (local-first)

The desktop is local-first with **no cloud**. So how does phone data reach the desktop's
`wellframe.db`? Options, cheapest first:

- **Export / import** — phone writes a file (JSON/SQLite), user imports on desktop.
  Trivial, manual, no infra. Good first version.
- **Local-network sync** — phone and desktop on the same Wi-Fi exchange directly.
  Local-first-friendly; more engineering (discovery, conflict handling).
- **Optional private cloud** — iCloud or an end-to-end-encrypted relay for
  set-and-forget sync. Best UX; most work; softens the "no backend" stance (make it opt-in).

Recommendation: ship **export/import** first (proves the loop), design a versioned sync
record so local-network or cloud sync can layer on without schema churn.

## Effort & sequencing

- Depends on: a stable desktop `wellframe.db` schema (have it) + a sync record format (to design).
- Milestones: (1) HealthKit read + a local store, (2) export/import to desktop,
  (3) on-phone check-in, (4) glanceable readiness, (5) App Store/TestFlight.
- Non-trivial: HealthKit privacy review, App Store review, and the sync protocol are
  each real work. Treat this as its own multi-week track, after desktop + mcpb land.

## Explicitly out of scope right now

Not started; not needed for "works on all machines" (that means all *desktop* platforms,
already covered). Revisit when Apple Health import becomes the priority.
