import { TimelineFilters as Component } from "../../../components/timeline/TimelineFilters";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Component>;

const CHIPS = [
  { filterKey: "all", label: "All" },
  { filterKey: "run", label: "Runs" },
  { filterKey: "ride", label: "Rides" },
  { filterKey: "strength", label: "Strength" },
  { filterKey: "briefing", label: "Briefings" },
  { filterKey: "mood", label: "Mood" },
  { filterKey: "weight", label: "Weight" },
];

const scenarios: Record<string, Props> = {
  // The full chip row with All active and an empty search.
  Default: { chips: CHIPS, activeType: "all", query: "" },
  // A type chip selected — the active chip flips to ink.
  ActiveChip: { chips: CHIPS, activeType: "run", query: "" },
  // A search query typed into the box.
  Searching: { chips: CHIPS, activeType: "all", query: "trail" },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s = "Default" } = await searchParams;
  const props = scenarios[s];
  if (!props) {
    return <div>Unknown scenario: {s}</div>;
  }
  return (
    <div id="codeyam-capture">
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 1000, padding: "40px 44px" }}>
        <Component {...props} />
      </div>
    </div>
  );
}
