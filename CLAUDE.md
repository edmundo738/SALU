# CLAUDE.md

As regras de trabalho estão em **`AGENTS.md`**. O estado actual está em **`PROJECT_STATE.md`** e **`CHECKPOINT.md`**.

Resumo:

- Um único sistema: `shared/` + `server/` + `src/`.
- Identidade só pela sessão do servidor.
- Sem pagamentos/escrow, sem dados inventados, sem OAuth mock.
- Cada transição autorizada no servidor.
- Testar com duas contas independentes.
- `npm run build`, `npm test`, `npm audit` antes de dizer que está pronto.
- Deploy de produção ainda não verificado (`P0-12` parcial).
