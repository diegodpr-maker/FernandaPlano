import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import parse from 'html-react-parser';

// Migration boundary: preserve the proven domain logic and delegated events,
// while React renders each view. A new key preserves the original form reset behavior.
const roots = new Map();
let revision = 0;
function draw(id, children) {
  if (!roots.has(id)) roots.set(id, createRoot(document.getElementById(id)));
  flushSync(() => roots.get(id).render(<React.Fragment key={++revision}>{children}</React.Fragment>));
}
export function renderView(html) { draw('main', parse(html)); }
export function renderDialog(html) { draw('modal', parse(html)); }
export function renderNavigation(tabs, view) {
  draw('tabs', tabs.map(([key, label]) => <button key={key} className="tab" role="tab" aria-selected={view === key} data-act="tab" data-k={key}>{label}</button>));
}
