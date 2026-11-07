import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import parse from 'html-react-parser';

const roots = new Map();
let revision = 0;
let dialogOpener = null;
let previousOverflow = '';
const focusable = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], summary, [tabindex="0"]';
function draw(id, children, reset = true) {
  const container = document.getElementById(id);
  const active = container.contains(document.activeElement) ? document.activeElement : null;
  const signature = active ? { id: active.id, tag: active.tagName, data: { ...active.dataset } } : null;
  if (!roots.has(id)) roots.set(id, createRoot(container));
  flushSync(() => roots.get(id).render(<React.Fragment key={reset ? ++revision : id}>{children}</React.Fragment>));
  // Delegated actions redraw the view. Keep keyboard users on the same control.
  if (signature && !active.isConnected) {
    const replacement = signature.id ? document.getElementById(signature.id) :
      [...container.querySelectorAll(focusable)].find(el => el.tagName === signature.tag && Object.keys(signature.data).length && Object.entries(signature.data).every(([key, value]) => el.dataset[key] === value));
    replacement?.focus({ preventScroll: true });
  }
  for (const region of container.querySelectorAll('.scroll-x')) {
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', 'Tabela com rolagem horizontal');
  }
}
export function renderView(html) { draw('main', parse(html)); }
export function renderDialog(html) {
  const wasOpen = !!document.querySelector('#modal [role="dialog"]');
  if (html && !wasOpen) {
    dialogOpener = document.activeElement;
    previousOverflow = document.body.style.overflow;
  }
  draw('modal', parse(html));
  const dialog = document.querySelector('#modal [role="dialog"]');
  for (const background of document.querySelectorAll('.top, main, .skip-link')) background.toggleAttribute('inert', !!dialog);
  if (dialog) {
    document.body.style.overflow = 'hidden';
    const title = dialog.querySelector('h3, h2');
    if (title) { title.id = 'dialog-title'; dialog.setAttribute('aria-labelledby', title.id); }
    else dialog.setAttribute('aria-label', 'Janela do plano');
    dialog.tabIndex = -1;
    dialog.focus({ preventScroll: true });
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll(focusable)].filter(el => el.getClientRects().length && !el.closest('[hidden]'));
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); dialog.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
    });
  } else if (wasOpen) {
    document.body.style.overflow = previousOverflow;
    if (dialogOpener?.isConnected) dialogOpener.focus({ preventScroll: true });
    dialogOpener = null;
  }
}
export function renderNavigation(tabs, view) {
  const activate = (event, index) => {
    const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const button = document.getElementById(`tab-${tabs[keys[event.key]][0]}`);
    button.focus(); button.click();
  };
  draw('tabs', tabs.map(([key, label], index) => <button key={key} id={`tab-${key}`} className="tab" role="tab" aria-controls="main" aria-selected={view === key} tabIndex={view === key ? 0 : -1} data-act="tab" data-k={key} onKeyDown={event => activate(event, index)}>{label}</button>), false);
  document.getElementById('main').setAttribute('aria-labelledby', `tab-${view}`);
  const nav = document.getElementById('tabs'), selected = document.getElementById(`tab-${view}`);
  if (selected.offsetLeft < nav.scrollLeft) nav.scrollLeft = selected.offsetLeft;
  else if (selected.offsetLeft + selected.offsetWidth > nav.scrollLeft + nav.clientWidth) nav.scrollLeft = selected.offsetLeft + selected.offsetWidth - nav.clientWidth;
}
