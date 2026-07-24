// One numbered setup step in the day-one onboarding state: index, title/body,
// and a Connect button that routes into the Connections panel.

export interface OnboardStepData {
  n: string;
  title: string;
  body: string;
  primary?: boolean;
}

export function OnboardStep({
  step,
  onConnect = () => {},
  connected = false,
}: {
  step: OnboardStepData;
  onConnect?: () => void;
  connected?: boolean;
}) {
  return (
    <article className={`wf-step${connected ? ' is-connected' : ''}`}>
      <div className="wf-step-num">{step.n}</div>
      <div className="wf-step-main">
        <h3>{step.title}</h3>
        <p>{step.body}</p>
      </div>
      <button
        className={`wf-btn${step.primary && !connected ? ' p' : ''} wf-step-btn`}
        type="button"
        onClick={onConnect}
      >
        {connected ? '✓ Connected' : 'Connect'}
      </button>
    </article>
  );
}
