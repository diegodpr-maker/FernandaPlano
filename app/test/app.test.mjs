import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';

test('preserva registros, navega nas nove telas, salva questões e restaura backup', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://example.test/FernandaPlano/', pretendToBeVisual: true });
  for (const key of ['window','document','navigator','location','localStorage','HTMLElement','Element','Node','MutationObserver','DOMParser','Event','MouseEvent']) {
    Object.defineProperty(globalThis, key, { configurable: true, value: key === 'window' ? dom.window : dom.window[key] });
  }
  globalThis.addEventListener = dom.window.addEventListener.bind(dom.window);
  globalThis.removeEventListener = dom.window.removeEventListener.bind(dom.window);
  dom.window.scrollTo = () => {};
  const index = await fs.readFile('dist/index.html','utf8');
  const entry = index.match(/src="\.\/(assets\/[^" ]+\.js)"/)[1];
  await import(new URL('../dist/' + entry, import.meta.url));
  const wait = async fn => { for(let i=0;i<100;i++){ if(fn()) return; await new Promise(r=>setTimeout(r,30)); } assert.fail('Tela não ficou pronta: '+document.body.textContent.slice(0,500)); };
  const click = selector => { const el = document.querySelector(selector); assert.ok(el, selector); el.click(); };
  await wait(() => document.querySelector('[data-k="hoje"]'));
  assert.match(document.querySelector('main').textContent, /Olá, Fernanda/);
  click('[data-act="ck"]');
  await wait(() => localStorage.getItem('fr_plano_v1'));
  const saved = JSON.parse(localStorage.getItem('fr_plano_v1'));
  assert.ok(saved.S.topics.some(t => t.ck.a || Object.values(t.ck).some(Boolean)));
  for (const k of ['plano','temas','questoes','caderno','desempenho','biblioteca','editais','config','hoje']) {
    click(`[data-k="${k}"]`);
    assert.ok(document.querySelector('main').textContent.trim().length > 50, k);
  }
  click('[data-act="logq"]');
  click('[data-q="area"][data-a="CM"]');
  document.getElementById('qt').value = '20';
  document.getElementById('qc').value = '15';
  click('[data-act="savelog"]');
  await wait(() => JSON.parse(localStorage.getItem('fr_plano_v1')).LOGS.length === 1);
  const withLog = JSON.parse(localStorage.getItem('fr_plano_v1'));
  assert.equal(withLog.LOGS[0].t,20);
  assert.equal(withLog.LOGS[0].c,15);
  click('[data-k="config"]');
  click('[data-act="backup"]');
  const backup = document.getElementById('bk').value;
  assert.equal(JSON.parse(backup).LOGS.length,1);
  click('[data-act="mclose"]');
  click('[data-act="restore"]');
  const textarea = document.querySelector('#modal textarea');
  textarea.value = backup;
  click('#rsok');
  assert.match(document.getElementById('toast').textContent,/restaurad|importad/i);
  dom.window.dispatchEvent(new dom.window.Event('pagehide'));
  dom.window.close();
});

