import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import './styles.css';

function InstallStatus() {
  const [prompt, setPrompt] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [ready, setReady] = useState(false);
  const [update, setUpdate] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const onPrompt = e => { e.preventDefault(); setPrompt(e); };
    const onNetwork = () => setOffline(!navigator.onLine);
    const onInstall = () => setPrompt(null);
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
  return <div className="pwa-status">
    <div className="row sp"><span role="status" className="muted small">{offline ? 'Sem conexão · dados salvos neste aparelho' : ready ? 'Disponível offline neste aparelho' : 'Dados salvos neste aparelho'}</span><button className="btn sm" onClick={install}>Instalar aplicativo</button></div>
    {help && <p className="small">No Android ou computador, use “Instalar aplicativo” no menu do navegador. No iPhone, abra no Safari e toque em Compartilhar → Adicionar à Tela de Início. A opção depende do navegador.</p>}
    {update && <p className="small" role="status">Uma atualização está pronta. Para aplicá-la, feche todas as abas e janelas do aplicativo e abra novamente.</p>}
  </div>;
}
function App() {
  return <><header className="top"><div className="top-in"><div className="brand"><b>Plano de Residência · Fernanda Rabello</b><span id="saveState" className="save" /></div><InstallStatus /><nav className="tabs" id="tabs" role="tablist" aria-label="Seções do plano" /></div></header><main id="main" /><div id="modal" /><div id="toast" role="status" /></>;
}
flushSync(() => createRoot(document.getElementById('root')).render(<App />));
import('./engine.js').catch(() => {
  document.getElementById('main').textContent = 'Não foi possível abrir o plano. Recarregue a página; seus dados permanecem neste aparelho.';
});
