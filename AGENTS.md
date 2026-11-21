# AGENTS.md — regras de trabalho no SALU

Este ficheiro é a primeira coisa a ler em cada sessão.

## Fonte de verdade

1. O repositório manda. Se a documentação e o código divergirem, o código manda e a documentação deve ser corrigida na mesma sessão.
2. Antes de alterar: `git status`, `git log -5`, ler `PROJECT_STATE.md`, `CHECKPOINT.md`, `KNOWN_ISSUES.md` e o estado da auditoria.
3. Há **um** sistema. Não criar uma quarta geração de arquitectura, um segundo modelo de dados, um segundo serviço ou componentes duplicados.

## Evidência

- `FACT` = lido no código.
- `MEASURED` = comando executado com resultado.
- `OBSERVED` = comportamento visto por HTTP/UI.
- `INFERRED` / `HYPOTHESIS` = não é prova.
- `UNKNOWN` ≠ `FALSE`; `NOT TESTED` ≠ `PASS`.
- Nunca declarar uma correcção feita sem teste. Nunca inventar dados para preencher um ecrã.

## Identidade e segurança

- Identidade só a partir da sessão no servidor. Nunca confiar em `user_id`, `provider_id`, `sender_id` ou `currentUserId` do browser.
- Toda a transição de estado é autorizada no servidor, por recurso.
- Uma conta por pessoa; um modo activo (cliente/prestador) escolhido no onboarding e alterável nas definições.
- Não adicionar OAuth, pagamentos, escrow, carteira ou verificação automática sem integração real e licenciada.
- Ficheiros: validar assinatura, limite, finalidade e visibilidade. Nunca servir um ficheiro privado a terceiros.

## Produto

- Preservar a identidade visual: `#081C41`, `#F97316`, `#1D6FE5`, fundo claro `#F8FAFC`, escuro `#060E20`, Bricolage nos títulos.
- PT-AO primeiro; inglês completo quando existir. Texto de interface por chaves em `src/i18n`, sem misturar línguas.
- Cada botão tem propósito, estado de carregamento e confirmação do servidor antes de dizer “feito”.
- Sem números inventados, sem “Just now” eterno, sem datas fixas, sem preços pré-preenchidos.
- Loading/erro/vazio/sucesso/retry em todos os fluxos.
- Teclado, foco, skip link, contraste, alvos ≥ 44 px, `prefers-reduced-motion`.

## Método

1. Compreender → inspeccionar → definir → implementar → testar → inspeccionar → verificar → documentar → avançar.
2. Testar o que o utilizador **não** pode fazer (acesso cruzado, duplicação, estado inválido).
3. Duas sessões independentes (dois cookie jars) em todos os testes de fluxo.
4. Actualizar `PROJECT_STATE.md`, `CHECKPOINT.md`, `CHANGELOG.md` e os docs afectados na mesma alteração.
5. Commits pequenos e descritivos; não fazer push para outra branch.
6. **BUILD, DON'T FREEZE.** A obrigação não é dizer que está bom; é produzir evidência.

## Comandos

```bash
npm run server     # API
npm run dev        # frontend
npm run build      # tsc + vite
npm test           # integração + geo + render
npm audit
```

Nunca iniciar servidores com `&`/`sleep` em ferramentas de execução curta; usar o gestor de processos.
