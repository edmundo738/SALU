# TESTING — como provar que o SALU funciona

## Comandos

```bash
npm test                 # 3 ficheiros, 16 testes
npm run build            # tsc --noEmit + vite build
npm audit                # dependências
npm run server           # API em :3001
npm run dev              # interface em :5173 (proxy /api)
```

## O que os testes cobrem

### `tests/api.integration.test.ts` — servidor real, SQLite temporário

Arranca `server/index.ts` na porta 3211 com `SALU_DATA_DIR` temporário e `SALU_ADMIN_TOKEN`.

Fluxo observado:

1. Registo de três contas independentes (dois clientes de teste + um terceiro).
2. `/auth/me` sem cookie → 401.
3. Onboarding válido; localização inválida → 400.
4. Perfil profissional publicado; aparece em `GET /providers`.
5. Pedido com fotografia real (PNG 4×4); terceiro não vê o pedido → 403.
6. Proposta de Bruno; conversa criada; terceiro não lê conversa (403) nem aceita proposta (403).
7. Ana aceita; acordo `PENDING_PROVIDER`; Ana tenta aceitar outra vez → 409.
8. Bruno aceita; estado `ACTIVE`.
9. Bruno envia mensagem com anexo privado; Ana lê; terceiro recebe 404 no ficheiro.
10. Bruno submete conclusão com prova; não pode confirmar o lado do cliente → 403.
11. Ana confirma; estado `COMPLETED`; pedido `COMPLETED`.
12. Avaliação de Ana (5,5,4) → média 4.7, 1 avaliação; duplicado → 409; terceiro → 403.
13. Denúncia, moderação por admin, recurso do autor, estado persistente.
14. Upload HTML → 400; upload de 7 MB → 413; endpoint de escrow/bots → 404; login com senha antiga → 401; Origin malicioso → 403.
15. Reinício do servidor: login e pedido `COMPLETED` continuam presentes.
16. Logout invalida a sessão no servidor.
17. 22 tentativas de login falhadas → 429.

### `tests/geo.test.ts`

16 municípios de Luanda; Camama próprio; Talatona ≠ Camama; Icolo e Bengo com 7 municípios; Zango fora de Luanda; etiqueta sem repetir o município.

### `tests/ui.render.test.tsx`

Renderização SSR com `renderToPipeableStream` (Suspense + rotas lazy):

- landing;
- login/registo;
- ajuda, segurança, termos, privacidade;
- 404;
- rota protegida sem sessão não rebenta.

## Teste manual de duas sessões (obrigatório)

Executado nesta sessão com `curl`/`fetch` e dois cookie jars independentes:

```
Ana (cliente)          Bruno (prestador)          Carlos (terceiro)
registo                registo                     registo
onboarding Camama      onboarding Talatona
                       publica perfil
cria pedido + foto
                       vê oportunidade
                       envia proposta
aceita proposta
                                              → não lê conversa (403)
                                              → não aceita proposta (403)
aceita acordo          aceita acordo
                       envia mensagem + anexo
lê mensagem
                       submete conclusão + prova
confirma conclusão
avalia Bruno           avalia Ana
```

Resultado: todos os passos essenciais passaram. Isto prova o ciclo entre **duas contas reais**, com dados persistidos e autorização por recurso.

## Limitações de teste

- **Não há Chromium/Playwright** neste ambiente. Não foi feito teste de browser real nem medição de contraste por ferramenta.
- A renderização SSR verifica que os componentes não rebentam e que o HTML esperado existe; não simula cliques.
- Não há teste de carga, nem teste multi-instância.
- O teste de upload usa uma imagem real minúscula; não substitui um teste com ficheiros de telemóvel reais.
- `NOT TESTED ≠ PASS`: o deploy de produção, e-mail, SMS e pagamentos não foram testados porque não existem/estão fora do ambiente.

## Checklist manual antes de release

- [ ] Abrir em 375 px sem scroll horizontal.
- [ ] Navegar só com teclado; foco visível; skip link funciona.
- [ ] Modal fecha com Escape e devolve foco.
- [ ] Mudar idioma e tema em Definições; recarregar; preferência mantida.
- [ ] Abrir `/pedidos/:id` directamente e recarregar.
- [ ] Voltar atrás no browser após cada transição.
- [ ] Duas contas em janelas separadas; confirmar que uma não vê o chat da outra.
- [ ] Upload de JPEG grande de telemóvel; confirmar compressão e preview.
- [ ] Desligar a API; confirmar erro visível e retry, sem sucesso falso.
- [ ] `curl -i https://<netlify>/api/health` devolve 503 JSON, não HTML.
