// The right-aligned connection status indicator on a provider row: a signal
// dot + status-line detail when connected/synced, or a plain warning-colored
// label when the last attempt errored.

export function ProviderStatusPill({
  detail,
  error = false,
}: {
  detail: string;
  error?: boolean;
}) {
  if (error) {
    return <span className="wf-conn-status err">{detail}</span>;
  }
  return (
    <span className="wf-conn-status">
      <span className="wf-conn-dot" />
      {detail}
    </span>
  );
}
