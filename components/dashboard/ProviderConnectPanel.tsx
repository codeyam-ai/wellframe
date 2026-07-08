// The expanded connect area beneath an available provider row. Owns the connect
// state machine (which method, the typed value, pending, inline error) and
// composes the MethodChooser (when there's a choice) with the MethodForm.
'use client';

import { useState } from 'react';
import {
  METHOD_META,
  validateConnectInput,
  type ProviderView,
  type ConnectMethod,
} from './connections';
import type { ConnectResult } from '@/app/lib/connections.actions';
import { MethodChooser } from './MethodChooser';
import { MethodForm } from './MethodForm';

export function ProviderConnectPanel({
  view,
  onConnect = async () => ({ ok: true }),
  onCancel = () => {},
}: {
  view: ProviderView;
  onConnect?: (id: string, method: ConnectMethod, value: string) => Promise<ConnectResult>;
  onCancel?: () => void;
}) {
  const methods = view.methods;
  const [method, setMethod] = useState<ConnectMethod | null>(
    methods.length === 1 ? methods[0] : null,
  );
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const meta = method ? METHOD_META[method] : null;

  async function submit() {
    if (!method) return;
    if (METHOD_META[method].needsInput) {
      const v = validateConnectInput(method, value);
      if (v) {
        setError(v);
        return;
      }
    }
    setPending(true);
    setError(null);
    const res = await onConnect(view.id, method, value);
    setPending(false);
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong. Try again.');
      return;
    }
    // Success — the revalidated props re-render the row as connected.
    onCancel();
  }

  return (
    <div className="wf-conn-flow">
      {methods.length > 1 && (
        <MethodChooser
          methods={methods}
          selected={method}
          onSelect={(m) => {
            setMethod(m);
            setError(null);
            setValue('');
          }}
        />
      )}

      {meta && method && (
        <MethodForm
          meta={meta}
          method={method}
          value={value}
          onChange={(v) => {
            setValue(v);
            setError(null);
          }}
          error={error}
          pending={pending}
          providerName={view.name}
          onSubmit={submit}
        />
      )}
    </div>
  );
}
