# SALU

Plataforma que liga prestadores de serviços em Luanda a quem precisa deles — e que faz
uma coisa que um grupo de WhatsApp não faz: **guarda o perfil**, para que continue a ser
encontrado amanhã.

> Hipótese em teste: tornar as oportunidades de serviço locais persistentes e
> pesquisáveis aumenta o número de pessoas que conseguem o primeiro cliente.
> **Ainda não está provado.** Prova-se com pessoas reais, não com este ficheiro.

## Estado actual — incremento 1

Percurso implementado, de ponta a ponta:

1. Prestador publica o perfil.
2. Cliente encontra por pesquisa, categoria e município.
3. Cliente abre o perfil e toca em **Falar no WhatsApp**.
4. O SALU registra que o contacto aconteceu.

O que **não** existe ainda: contas de utilizador, pedidos, respostas, avaliações,
base de dados partilhada. Ver [docs/MODELO_DE_DADOS.md](docs/MODELO_DE_DADOS.md).

## Como correr

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # regras de domínio e camada de dados
npm run build    # verificação de tipos + build de produção
```

Sem variáveis de ambiente a aplicação arranca em **modo local**: os perfis ficam no
dispositivo e a interface avisa. Para o modo partilhado, copiar `.env.example` para
`.env.local`, preencher com um projecto Supabase e aplicar
`supabase/migrations/0001_incremento_1.sql`.

## Estrutura

```
src/domain/    regras puras (tipos, validação, telefone, filtros, WhatsApp)
src/data/      contrato de dados + adaptador local + adaptador Supabase
src/state/     estado da aplicação (Zustand)
src/components/  interface sem regras de negócio
src/pages/     ecrãs
tests/         testes
docs/          decisões de arquitectura e modelo de dados
```

## Decisões que moldaram o projecto

- **WhatsApp como canal de contacto**, não como rival. Não construímos chat.
- **Sem pagamentos.** O SALU aproxima as partes; não gere dinheiro.
- **Acesso gratuito para quem procura trabalho.** Nunca cobrar a quem não tem rendimento.
- **Sem dados inventados a passar por reais.** Perfis de exemplo têm selo e contacto
  desactivado.
- **Stack:** React + TypeScript + Vite + Tailwind + Supabase. Justificação e
  alternativas recusadas em [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md).

## Métrica

**Pessoas que receberam o primeiro pagamento através do SALU.**

O protótipo mede o que consegue medir sozinho — contactos iniciados — e não finge medir
o resto. Trabalhos concluídos e primeiros rendimentos obtêm-se perguntando às pessoas.

## Limitações conhecidas

- Modo local: os perfis existem apenas num dispositivo.
- Sem contas: qualquer pessoa publica um perfil.
- Adaptador Supabase escrito mas nunca testado contra um projecto real.
- Migração SQL nunca executada.
