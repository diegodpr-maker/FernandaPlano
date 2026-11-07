# FernandaPlano

[Abrir aplicativo](https://diegodpr-maker.github.io/FernandaPlano/)

Plano de estudos para residência médica: cronograma, temas, questões, desempenho, biblioteca de imagens, editais e caderno de erros.

## PWA

Abra o site uma vez com internet e aguarde “Disponível offline neste aparelho”. Use **Instalar aplicativo** ou o menu do navegador. No iPhone: Safari → Compartilhar → Adicionar à Tela de Início. Links externos continuam dependendo de internet.

Uma versão nova é baixada em segundo plano. Quando houver aviso, feche todas as abas e janelas do aplicativo e abra novamente. O cache de arquivos não contém os registros de estudo.

## Dados e compatibilidade

Mantidos `fr_plano_v1` (localStorage), `fr_last_backup` e `fr_plano_img` (IndexedDB), além do formato de backup original. Dados do mesmo endereço e navegador continuam disponíveis. Para mudar de aparelho, navegador ou endereço, exporte e importe um backup em Ajustes. Não há login nem sincronização entre aparelhos. O servidor não recebe os registros.

## Desenvolvimento

Requer Node 24 ou posterior.

```sh
cd app
npm ci
npm run dev
```

```sh
npm run build
npm test
npm start
```

O servidor abre em `http://localhost:3000`. `GET /api/health` informa a saúde do serviço. Manifesto e service worker funcionam na raiz do Docker e no subdiretório do GitHub Pages.

## Docker

```sh
cd app
docker compose up -d --build
```

O container usa Node 24, roda sem root e serve o build React. Em um servidor público, configure HTTPS no proxy ou plataforma de hospedagem: o PWA exige HTTPS, exceto em localhost. GitHub Pages hospeda o build estático, não executa o container Node. Não é necessário banco ou volume para esta versão, pois os dados permanecem no navegador.

## Estrutura e publicação

- `app/src/main.jsx`: estrutura React, instalação e estado do PWA.
- `app/src/renderer.jsx`: renderização React das telas e diálogos, com adaptação dos templates existentes.
- `app/src/engine.js`: regras, persistência e eventos preservados do sistema original. A migração é incremental: os templates das telas ainda são gerados por essas funções e convertidos em elementos React.
- `app/src/caderno.js`: lógica do caderno de erros.
- `app/server.mjs`: servidor HTTP Node sem dependências de produção.
- `app/scripts/build-sw.mjs`: cache versionado de todos os arquivos do aplicativo.
- `.github/workflows/deploy.yml`: build, testes, construção e verificação do Docker, publicação em Pages.

Configure Settings → Pages → Source como **GitHub Actions**. Cada push na main testa e publica `app/dist`; o HTML na raiz é a versão anterior preservada para referência e não é a fonte da publicação atual.

Os testes cobrem navegação nas nove seções, gravação, backup/restauração, servidor e navegação sem rede pelo service worker. A instalação como aplicativo também depende do suporte do navegador do usuário.
