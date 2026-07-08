// The connect-method options for a provider (e.g. "Sign in with your browser"
// vs "Paste an API key"). Shown only when a provider supports more than one
// method; the selected option is highlighted.
'use client';

import { METHOD_META, type ConnectMethod } from './connections';

export function MethodChooser({
  methods,
  selected = null,
  onSelect = () => {},
}: {
  methods: ConnectMethod[];
  selected?: ConnectMethod | null;
  onSelect?: (method: ConnectMethod) => void;
}) {
  return (
    <div className="wf-method-choose">
      {methods.map((m) => (
        <button
          key={m}
          type="button"
          className={`wf-method-opt${selected === m ? ' is-sel' : ''}`}
          onClick={() => onSelect(m)}
        >
          {METHOD_META[m].label}
        </button>
      ))}
    </div>
  );
}
