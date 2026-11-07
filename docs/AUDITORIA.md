# Auditoria de persistência — 7 de novembro de 2026

## Como o progresso é salvo

Na publicação atual em GitHub Pages, `fr_plano_v1` no localStorage contém `{S, LOGS}`: temas e marcações, cronograma, tarefas semanais, revisões, simulados, caderno de erros, configurações e registros de questões. Alterações são agrupadas por 500 ms e também gravadas quando a página fica oculta ou é fechada (`visibilitychange` e `pagehide`). O localStorage é síncrono.

As imagens ficam no banco IndexedDB `fr_plano_img`, loja `i`; o estado principal contém os metadados. `fr_last_backup` registra quando o arquivo de backup foi gerado. O backup em arquivo inclui imagens; o backup em texto não inclui os arquivos das imagens.

Os dados pertencem à origem e ao perfil do navegador. Instalar o PWA e guardar arquivos offline não cria uma cópia do progresso no servidor. Limpar o armazenamento pode remover o progresso. Para trocar de aparelho, use o arquivo de backup. O repositório contém um adaptador opcional `window.claude.use`, mas ele não é fornecido pelo GitHub Pages; não existe sincronização de contas na publicação atual.

## Erros corrigidos

1. **Gravação sem nova tentativa após erro:** o identificador do timer permanecia preenchido depois da execução e impedia reagendamento. Agora ele é limpo, as chaves pendentes são preservadas e uma falha provoca nova tentativa. No adaptador remoto, meses de questões que falharam também são preservados.
2. **Restauração inválida alterava o estado antes de falhar:** a estrutura principal e os registros agora são validados antes da substituição. Texto e arquivo usam o mesmo fluxo, inclusive os valores padrão dos campos opcionais de versões antigas.
3. **Imagens sumiam ao restaurar:** a restauração verificava apenas o cache em memória. Agora consulta o armazenamento persistente para manter imagens ainda não abertas nesta sessão.
4. **Imagens pareciam gravadas após falha:** o cache era preenchido antes de o IndexedDB confirmar a transação. Agora ele só é atualizado após sucesso. Cancelamento de transação também rejeita a operação, e as imagens de uma restauração local são gravadas na mesma transação.
5. **Arquivo de backup silenciosamente incompleto:** a exportação agora interrompe e informa o erro se uma imagem referenciada não puder ser lida.
6. **Dados locais inválidos eram ignorados:** na abertura, um erro de leitura ou validação interrompe a inicialização e preserva o conteúdo original. A tela oferece baixar os dados brutos para recuperação, em vez de substituir silenciosamente por um plano novo.
7. **Leitura remota parcial contaminava o fallback local:** estado e questões remotos agora são atribuídos apenas após concluir e validar a leitura.

## Validação

- Build de produção e geração do service worker.
- Testes de navegação nas nove seções, marcações, questões e backup/restauração.
- Regressões de backup inválido sem alteração dos registros, compatibilidade dos campos opcionais, gravação após falha de quota e preservação das chaves remotas pendentes.
- Testes de IndexedDB: persistência após limpar o cache, gravação com falha, cancelamento de transação e restauração de imagens ainda não abertas.
- Abertura com conteúdo local corrompido: conteúdo permanece intacto e há opção de recuperação.
- Servidor HTTP e cache de navegação offline.
- `npm audit`: nenhuma vulnerabilidade conhecida nas dependências instaladas na data da auditoria.

## Limites e pontos pendentes

Esta auditoria concentra-se em persistência, carregamento, imagens e backup; não é uma certificação de todas as regras do plano ou uma auditoria de segurança completa. Os testes da interface usam jsdom e os de IndexedDB usam fake-indexeddb. Não foi validado um navegador móvel real, a instalação do PWA em aparelhos ou o serviço remoto opcional com credenciais reais.

Ainda não há resolução de conflitos entre abas ou aparelhos, histórico automático de versões nem transação única entre localStorage e IndexedDB. O adaptador remoto mantém gravações em documentos separados. Backups periódicos continuam necessários. Recriar ou migrar o cronograma pode redefinir tarefas semanais vinculadas às semanas antigas; marcações dos temas e questões são dados separados.

As correções preservam os nomes de armazenamento existentes e não introduzem migração para banco de dados ou login.
