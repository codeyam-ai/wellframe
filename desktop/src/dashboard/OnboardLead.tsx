// The lead block of the day-one onboarding state: the "no data yet" placeholder
// dial, the headline, and the privacy-first intro copy.

export function OnboardLead() {
  return (
    <div className="wf-onboard-lead">
      <div className="wf-onboard-dial">
        <span className="ring" />
        <span className="hint">No data yet</span>
      </div>
      <h1>Let&apos;s set up your first briefing.</h1>
      <p>
        Wellframe reads only what lives on this machine. Connect your coach
        and a health source, and your first briefing appears here, privately.
      </p>
    </div>
  );
}
