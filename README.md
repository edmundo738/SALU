# SALU

Plataforma que liga quem sabe fazer a quem precisa — e que faz uma coisa que um grupo de
WhatsApp não faz: **guarda o perfil e o pedido**, para que continuem a ser encontrados
amanhã.

> Hipótese em teste: tornar as oportunidades de serviço locais persistentes e
> pesquisáveis aumenta o número de pessoas que conseguem o primeiro cliente.
> **Ainda não está provado.** Prova-se com pessoas reais, não com este ficheiro.

## O que é

Um protótipo funcional para o concurso **Africa Builds Tech — Jovens Talentos 2026**
(28 de Novembro). Não é um serviço em produção: não há contas reais, verificação de
identidade nem pagamentos.

Dois lados do mercado, um percurso cada:

**Prestador** — entra → cria perfil com ofício, bairro, apresentação e fotografia →
aparece na pesquisa → encontra pedidos no mural, envia propostas e fala por WhatsApp →
quando o trabalho termina, recebe avaliação.

**Cliente** — entra → publica um pedido com fotografia, categoria e bairro → recebe
propostas e conversa com quem as enviou → aceita uma proposta → marca o trabalho como
concluído → avalia o profissional.

Regra de direcção: **quem publica o pedido não contacta ninguém — o primeiro passo é de
quem vai resolver.** O autor de um pedido (ou o dono de um perfil) não vê o botão de
WhatsApp para si próprio.

## Como correr

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # regras de domínio e camada de dados
npm run build    # verificação de tipos + build de produção
```

Sem variáveis de ambiente a aplicação arranca em **modo demonstração**: os dados ficam
no dispositivo e a interface avisa. Nesse modo, `/entrar` oferece **personagens com
história** (pedidos, propostas, conversas e avaliações já criados) para percorrer os dois
lados do mercado sem começar do zero — ver [docs/DEMO.md](docs/DEMO.md). Para o modo partilhado, copiar `.env.example` para
`.env.local`, preencher com um projecto Supabase e aplicar as migrações em
`supabase/migrations/`.

## Rotas

| Rota | Ecrã |
|---|---|
| `/` | Início: pesquisa, categorias, profissionais e pedidos recentes |
| `/entrar` | Escolha do lado do mercado (sessão de demonstração) |
| `/explorar` | Directório de profissionais |
| `/perfil/novo` | Criar perfil de prestador |
| `/perfil/:id` | Perfil público + contacto por WhatsApp |
| `/pedidos` | Mural de pedidos abertos |
| `/pedidos/:id` | Detalhe do pedido: propostas, conversa, estado, contacto por WhatsApp |
| `/publicar-pedido` | Publicar um pedido |
| `/painel` | Painel por papel (cliente ou prestador) com os próximos passos |
| `/notificacoes` | Notificações calculadas a partir dos dados da sessão |
| `/confianca` | Profissionais guardados como de confiança |
| `/seguranca` | Orientações de segurança e denúncia |
| `/minha-area` | Redirecciona para `/painel` |
| `/planos` | Modelo de negócio proposto |
| `/interno` | Acompanhamento do protótipo |

## Estrutura

```
src/domain/    regras puras (tipos, validação, telefone, filtros, WhatsApp)
src/data/      contrato de dados + adaptador local + adaptador Supabase
src/state/     estado da aplicação e sessão de demonstração
src/components/  interface sem regras de negócio
src/pages/     ecrãs
src/lib/       compressão de imagem e formatação
tests/         testes
docs/          decisões de arquitectura e modelo de dados
```

## Decisões que moldaram o projecto

- **WhatsApp como canal de contacto**, não como rival. Não construímos chat.
- **Sem pagamentos.** O SALU aproxima as partes; não gere dinheiro.
- **Acesso gratuito para quem procura trabalho.** Nunca cobrar a quem não tem rendimento.
- **Sem autenticação no protótipo**, e a interface di-lo em vez de o esconder.
- **Sem dados inventados a passar por reais.** Tudo o que é exemplo tem selo e contacto
  desactivado.
- **Stack:** React + TypeScript + Vite + Tailwind + Supabase (importado dinamicamente).
  Justificação e alternativas recusadas em [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Métrica

**Pessoas que receberam o primeiro pagamento através do SALU.**

O protótipo mede o que consegue medir sozinho — contactos iniciados, separados por lado
do mercado — e não finge medir o resto. Trabalhos concluídos e primeiros rendimentos
obtêm-se perguntando às pessoas.

## Limitações conhecidas

- **Um só dispositivo.** Perfis e pedidos criados aqui não aparecem noutro telemóvel.
- **Sem contas.** Qualquer pessoa publica. A posse do que cada pessoa criou é guardada
  por nome, no dispositivo: duas pessoas com o mesmo nome colidem.
- **Adaptador Supabase nunca testado** contra um projecto real.
- **Migrações SQL (`0001` a `0005`) nunca executadas.**
- **Fotografias** são comprimidas para caber no armazenamento local (~5 MB).
