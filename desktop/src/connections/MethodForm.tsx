// The per-method connect form: a plain-language hint, an optional input (API
// key or endpoint), an inline error, and the submit button. Presentational —
// the parent ProviderConnectPanel owns the state and the connect call.

import type { MethodMeta, ConnectMethod } from './connections';

export function MethodForm({
  meta,
  method,
  value,
  onChange = () => {},
  error = null,
  pending = false,
  providerName,
  onSubmit = () => {},
}: {
  meta: MethodMeta;
  method: ConnectMethod;
  value: string;
  onChange?: (value: string) => void;
  error?: string | null;
  pending?: boolean;
  providerName: string;
  onSubmit?: () => void;
}) {
  return (
    <div className="wf-method-form">
      <p className="wf-method-hint">{meta.hint}</p>
      {meta.needsInput && (
        <input
          className="wf-input"
          type={method === 'apiKey' ? 'password' : 'text'}
          placeholder={meta.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={pending}
          aria-label={meta.label}
        />
      )}
      {error && <p className="wf-method-err">{error}</p>}
      <div className="wf-method-actions">
        <button className="wf-btn p wf-conn-btn" type="button" onClick={onSubmit} disabled={pending}>
          {pending
            ? 'Connecting…'
            : meta.needsInput
              ? `Connect ${providerName}`
              : `Sign in to ${providerName}`}
        </button>
      </div>
    </div>
  );
}
