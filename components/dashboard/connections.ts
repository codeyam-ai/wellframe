// Data + shaping for the Connections/Setup panel. Client-safe (no server
// imports) so the panel can be a client component. The provider lists are
// static demo config; `asFresh` produces the day-one view where nothing is
// connected yet.

export interface Provider {
  id: string;
  name: string;
  blurb: string;
  connected?: boolean;
  detail?: string;
}

export const AI_PROVIDERS: Provider[] = [
  {
    id: 'claude',
    name: 'Claude',
    blurb: 'Anthropic. Runs privately on this machine. Nothing leaves it.',
    connected: true,
    detail: 'Local · 0 cloud calls',
  },
  { id: 'gemini', name: 'Gemini', blurb: "Google's model. Fast, good with plans." },
  { id: 'openai', name: 'OpenAI', blurb: 'ChatGPT models. Broad general knowledge.' },
];

export const HEALTH_SOURCES: Provider[] = [
  { id: 'apple', name: 'Apple Health', blurb: 'Sleep, heart rate, steps from your iPhone or Watch.', connected: true, detail: 'Synced 07:02' },
  { id: 'garmin', name: 'Garmin', blurb: 'Runs, HRV, and recovery from your watch.' },
  { id: 'oura', name: 'Oura', blurb: 'Overnight sleep and readiness from your ring.' },
  { id: 'whoop', name: 'Whoop', blurb: 'Strain and recovery from your band.' },
];

// Day-one view: strip every provider's connected/detail so the whole list
// reads as available-to-connect instead of inheriting the populated demo's
// connected statuses. When `fresh` is false, the list is returned unchanged.
export function asFresh(list: Provider[], fresh: boolean): Provider[] {
  return fresh ? list.map((p) => ({ ...p, connected: false, detail: undefined })) : list;
}
