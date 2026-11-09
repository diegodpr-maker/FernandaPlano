import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './styles.css';
import { unlock } from './auth.js';
import { localDB } from './local-db.js';
import { syncNow, subscribeSync, resolveConflict } from './sync.js';

function SyncStatus(){
 const [status,setStatus]=useState({message:'SQLite local'});
 useEffect(()=>subscribeSync(setStatus),[]);
 return <div className="pwa-status"><div className="row sp"><span className="small" role="status">{status.message}</span><button className="btn sm" onClick={()=>syncNow()}>Sincronizar agora</button></div>{status.conflict&&<div className="banner"><p>Escolha qual versão manter. Uma cópia da outra será baixada antes da troca.</p><button className="btn sm" onClick={()=>resolveConflict('online')}>Usar dados online neste aparelho</button><button className="btn sm" onClick={()=>resolveConflict('local')}>Enviar dados deste aparelho</button></div>}</div>;
}

function InstallStatus() {
  const [prompt, setPrompt] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [ready, setReady] = useState(false);
  const [update, setUpdate] = useState(false);
  const [help, setHelp] = useState(false);
  const [installed, setInstalled] = useState(() => window.matchMedia?.('(display-mode: standalone)')?.matches || !!navigator.standalone);
  useEffect(() => {
    const onPrompt = e => { e.preventDefault(); setPrompt(e); };
    const onNetwork = () => setOffline(!navigator.onLine);
    const onInstall = () => { setPrompt(null); setInstalled(true); setHelp(false); };
    addEventListener('beforeinstallprompt', onPrompt);
    addEventListener('appinstalled', onInstall);
    addEventListener('online', onNetwork);
    addEventListener('offline', onNetwork);
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then(reg => {
        navigator.serviceWorker.ready.then(() => setReady(true));
        if (reg.waiting) setUpdate(true);
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker?.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdate(true);
          });
        });
      }).catch(() => setReady(false));
    }
    return () => {
      removeEventListener('beforeinstallprompt', onPrompt);
      removeEventListener('appinstalled', onInstall);
      removeEventListener('online', onNetwork);
      removeEventListener('offline', onNetwork);
    };
  }, []);
  async function install() {
    if (!prompt) { setHelp(!help); return; }
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }
  return <>
    <div className="pwa-actions"><span role="status" className="muted small">{offline ? 'Sem conexão' : ready ? 'Offline disponível' : 'Plano de residência'}</span>{!installed && <button className="btn sm" aria-expanded={help} onClick={install}>Instalar<span className="sr-only"> aplicativo</span></button>}</div>
    {help && <p className="install-help small">No Android ou computador, use “Instalar aplicativo” no menu do navegador. No iPhone, abra no Safari e toque em Compartilhar → Adicionar à Tela de Início. A opção depende do navegador.</p>}
    {update && <p className="install-help small" role="status">Uma atualização está pronta. Para aplicá-la, feche todas as abas e janelas do aplicativo e abra novamente.</p>}
  </>;
}
function App() {
  return <>
    <a className="skip-link" href="#main">Ir para o conteúdo</a>
    <header className="top">
      <div className="top-in">
        <div className="brand">
          <div className="brand-identity">
            <img src={`${import.meta.env.BASE_URL}icon-192.png`} width="42" height="42" alt="" />
            <div>
              <h1>Fernanda Plano</h1>
              <span id="saveState" className="save" role="status" aria-live="polite" />
            </div>
          </div>
          <InstallStatus />
        </div>
        <div className="row sp"><button className="btn sm" onClick={() => location.reload()}>Bloquear</button></div>
        <SyncStatus />
        <nav className="tabs" id="tabs" role="tablist" aria-label="Seções do plano" />
      </div>
    </header>
    <main><div id="main" className="content" role="tabpanel" tabIndex={0} /></main>
    <div id="modal" />
    <div id="toast" role="status" />
  </>;
}
const root = createRoot(document.getElementById('root'));
function Unlock() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const password = form.elements.password.value;
    setBusy(true);
    setError('');
    try {
      const access=await unlock(password);
      const saved=await localDB.load();
      if(access.online && !saved.payload && !localStorage.getItem('fr_plano_v1'))await syncNow();
      flushSync(() => root.render(<App />));
      await import('./engine.js');
    } catch(e) {
      setError(e.message || 'Não foi possível desbloquear. Recarregue e tente novamente.');
    } finally { setBusy(false); }
  }
  return <main className="unlock-page"><section className="card unlock-card"><h1>Plano da Fernanda</h1><p className="muted">Digite a senha para abrir seu plano de estudos.</p><form onSubmit={submit}><label className="f" htmlFor="password">Senha<input id="password" name="password" type="password" inputMode="numeric" autoComplete="current-password" required autoFocus aria-describedby={error ? 'unlock-error' : undefined} /></label>{error && <p id="unlock-error" role="alert">{error}</p>}<button className="btn pri" type="submit" disabled={busy}>{busy ? 'Verificando…' : 'Entrar'}</button></form><InstallStatus /></section></main>;
}
flushSync(() => root.render(<Unlock />));
