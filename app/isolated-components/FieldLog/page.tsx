import { FieldLog as Component } from "../../../components/dashboard/FieldLog";
import type { ComponentProps } from "react";
import type { Workout } from "@prisma/client";

type Props = ComponentProps<typeof Component>;

const run: Workout = {
  id: 1,
  title: "Ridgeline Trail Run",
  typeLabel: "▸ Ridgeline Trail · Z2",
  photoUrl: "/images/trail.jpg",
  distance: "8.2 mi",
  pace: "8:42",
  vertical: "1,240 ft",
};

const scenarios: Record<string, Props> = {
  Default: { workout: run },
  NoWorkout: { workout: null },
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
      <div className="wf" style={{ minHeight: "auto", display: "block", width: "100%", maxWidth: 780 }}>
        <Component {...props} />
      </div>
    </div>
  );
}
