# FernandaPlano — SQLite online e offline

[Abrir aplicação](https://fernanda-plano-online.diego-dpr995234.chatgpt.site)

## Gravação e sincronização

O navegador executa SQLite com sql.js/WASM e persiste o arquivo binário em IndexedDB (`fr_sqlite_v1`). Cada gravação usa uma transação e só exibe confirmação depois de persistir. Um diário local recupera alterações de texto pendentes se o navegador fechar antes do debounce. Registros e imagens antigos são migrados sem apagar os originais.

A versão hospedada usa Cloudflare D1 (SQLite gerenciado). A alternativa Docker usa `node:sqlite` e um volume persistente. A API de sincronização é a mesma.

A sincronização ocorre ao recuperar a conexão, periodicamente a cada minuto e pelo botão **Sincronizar agora**. Atualizações online são baixadas para o SQLite local. Alterações de dois aparelhos baseadas na mesma revisão geram conflito explícito: a pessoa escolhe qual versão usar e baixa uma cópia da outra. O servidor preserva revisões anteriores. Reenvios têm identificador idempotente, evitando duplicação quando a resposta de uma gravação se perde. Uma aba desatualizada não pode sobrescrever silenciosamente outra.

Dados offline continuam locais até a sincronização. Primeiro acesso e primeiro cadastro do aparelho exigem internet. A verificação offline usa PBKDF2 com salt aleatório no aparelho e não criptografa os dados locais. A senha e o segredo de sessão online ficam em variáveis secretas da hospedagem, nunca no repositório. A API exige sessão HttpOnly, verifica origem e limita tentativas de login.

## Migração do endereço antigo

[GitHub Pages](https://diegodpr-maker.github.io/FernandaPlano/) exibe um link para a nova versão e permite exportar registros e imagens antigos. Importe o arquivo em Ajustes na nova versão. Instale o PWA pelo novo endereço. Para atualizar uma instalação antiga, feche todas as abas e janelas antes de abrir novamente.

## Desenvolvimento e Docker

```sh
cd app
npm ci
npm run build
npm test
```

Copie `.env.example` para `.env` e configure `APP_PASSWORD` e `SESSION_SECRET` com valores privados. Não versione esse arquivo. Com Docker instalado:

```sh
docker compose up -d --build
```

O volume `fernanda-data` mantém `/app/data/fernanda.sqlite`. Não remova o volume ao atualizar. Para executar Node diretamente, forneça as mesmas variáveis de ambiente e use `npm start`. Configure HTTPS para acesso público; localhost funciona no desenvolvimento.

## Testes

A suíte verifica senha incorreta/correta, navegação, gravação, backup/restauração, rejeição de backup inválido, SQLite binário reaberto, envio ao servidor, alteração simulada em outro aparelho, atualização do banco offline, persistência após reabertura do SQLite do servidor, conflitos, reenvio idempotente e cache offline.

## Estrutura

- `app/src/local-db.js`: SQLite offline e gravação transacional.
- `app/src/sync.js`: sincronização e resolução de conflitos.
- `app/src/auth.js`: autenticação online e desbloqueio offline.
- `app/api.mjs`: API comum ao Node e Worker.
- `app/node-db.mjs`: adaptador SQLite do Node.
- `app/db/schema.sql`: esquema do servidor.
- `app/scripts/build-worker.mjs`: empacotamento para hospedagem gerenciada.
- `portal/`: entrada do endereço antigo e exportação de dados.
- `app/src/engine.js`: funções originais preservadas, integradas à persistência SQLite.

O GitHub Actions compila, testa e verifica o container, e publica o portal. A aplicação online usa a publicação gerenciada de Sites. As mudanças no servidor online devem ser publicadas por esse fluxo, incluindo migrações de esquema.
