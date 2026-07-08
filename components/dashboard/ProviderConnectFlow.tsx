// The expanded "here's how connecting works" flow revealed beneath an active
// provider row. Deliberately plain-language: three steps, no codes or keys,
// then one confirming action.
'use client';

export function ProviderConnectFlow({
  name,
  onContinue = () => {},
}: {
  name: string;
  onContinue?: () => void;
}) {
  return (
    <div className="wf-conn-flow">
      <ol className="wf-conn-steps">
        <li>We open {name} in your browser and you sign in — no codes to copy.</li>
        <li>You approve Wellframe once. That's it.</li>
        <li>Your new coach is ready on the next briefing.</li>
      </ol>
      <button className="wf-btn p wf-conn-btn" type="button" onClick={onContinue}>
        Continue with {name}
      </button>
    </div>
  );
}
