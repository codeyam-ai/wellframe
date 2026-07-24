// Day-one onboarding state — the production default, since the database starts
// empty. Composes the onboarding lead and a numbered two-step setup that routes
// into the Connections panel. Plinth discipline: numbered steps + mono labels
// do the work, no illustration.

import { OnboardLead } from './OnboardLead';
import { OnboardStep, type OnboardStepData } from './OnboardStep';

const STEPS: OnboardStepData[] = [
  {
    n: '01',
    title: 'Connect your AI coach',
    body: 'Claude, Gemini, or OpenAI. It reads your history and turns it into a plain-language plan each morning.',
    primary: true,
  },
  {
    n: '02',
    title: 'Connect a health source',
    body: 'Apple Health, Garmin, Oura, or Whoop. This is where your overnight vitals come from.',
    primary: false,
  },
];

export function EmptyBriefing({
  onQueryCoach = () => {},
  onOpenSetup = () => {},
  coachConnected = false,
  healthConnected = false,
}: {
  onQueryCoach?: () => void;
  onOpenSetup?: () => void;
  coachConnected?: boolean;
  healthConnected?: boolean;
}) {
  // Step 01 is the AI coach, step 02 is the health source.
  const connectedByStep: Record<string, boolean> = {
    '01': coachConnected,
    '02': healthConnected,
  };
  return (
    <section className="wf-empty">
      <div className="wf-secnum">
        <span className="n">01 /</span> First Briefing
      </div>

      <div className="wf-onboard">
        <OnboardLead />

        <div className="wf-onboard-steps">
          {STEPS.map((s) => (
            <OnboardStep
              key={s.n}
              step={s}
              onConnect={onOpenSetup}
              connected={connectedByStep[s.n] ?? false}
            />
          ))}

          <div className="wf-onboard-foot">
            <span className="wf-empty-label">Nothing is shared without your say-so</span>
            <button className="wf-onboard-coach" type="button" onClick={onQueryCoach}>
              Query coach ⌘K
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
