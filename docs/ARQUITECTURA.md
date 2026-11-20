# Arquitectura — decisões e porquê

Documento vivo. Cada decisão tem a restrição que a justifica; se a restrição mudar,
a decisão pode mudar.

## Âmbito do incremento 1

Um único percurso, de ponta a ponta:

> Prestador publica perfil → cliente encontra → cliente toca em «Falar no WhatsApp» →
> contacto fica registado.

Tudo o resto (pedidos, respostas, avaliações) fica para o incremento seguinte. A razão
não é falta de ambição: é que este percurso já prova que a plataforma faz algo que um
grupo de WhatsApp não faz — guarda um perfil que continua a ser encontrado amanhã.

## Stack

| Camada | Escolha | Restrição que a justifica |
|---|---|---|
| Interface | React 18 + TypeScript | É a competência já demonstrada no projecto anterior do dono (~14.800 linhas) |
| Build | Vite 6 | Arranque e recarregamento instantâneos; sem servidor para configurar |
| Estilo | Tailwind 3.4 | Já usado; mantém a interface coerente e pequena |
| Estado | Zustand | Já usado; evita trazer uma framework de estado para quatro ecrãs |
| Dados | Supabase (PostgreSQL) | Elimina a necessidade de escrever um backend do zero — a maior lacuna existente |
| Autorização | Row Level Security | A segurança tem de estar na base de dados, não em código de servidor que ainda não existe |
| Testes | Vitest | Rápido, sem configuração, corre em Node |

### O que foi avaliado e recusado

**Next.js App Router.** O relatório de auditoria recomendou-o por causa do SEO das
páginas públicas. Recusado *neste incremento*: exige um modelo mental novo
(servidor/cliente) que consumiria dias sem produzir nada demonstrável, e o dono nunca
construiu um backend. O ganho é de crescimento orgânico, que só existe depois de haver
conteúdo. **Migra quando** as páginas de serviço por categoria passarem a receber
tráfego orgânico real. O Supabase mantém-se — só muda a camada de renderização.

**Autenticação por SMS (OTP).** Angola é destino suportado pela Twilio, mas o SMS
bidireccional não existe e cada mensagem custa ~US$ 0,315. Isso põe um custo por
utilizador e um ponto de falha ao vivo numa demonstração. **Adiado** para quando o
piloto justificar o custo, atrás de uma flag.

**Chat interno.** O WhatsApp já está instalado em todos os telemóveis e é onde as
pessoas falam. Construir chat seria meses de trabalho para chegar a um sítio pior.

**Pagamentos.** Fora de âmbito por decisão de produto. Também evita todo o perímetro
regulatório de serviços de pagamento.

## Peso do arranque

Angola: dados móveis caros. Medido no build de produção:

| | JS inicial (gzip) | chunk Supabase (gzip) |
|---|---|---|
| Antes | 122,3 kB | — |
| Depois | **62,1 kB** | 61,0 kB, carregado só quando necessário |

A biblioteca do Supabase é importada dinamicamente. Em modo local nunca chega a ser
descarregada. Sem fontes externas, sem ícones em pacote, sem biblioteca de datas.

## Camadas

```
src/
  domain/     regras puras: tipos, validação, telefone, filtros, link de WhatsApp
  data/       contrato RepositorioSalu + adaptador local + adaptador Supabase
  state/      store Zustand, uma só instância do repositório
  components/ peças de interface sem regras de negócio
  pages/      ecrãs
tests/        testes das regras puras e do adaptador local
```

**Porque existe `RepositorioSalu`:** não por gosto de abstracção. Sem ele não havia
forma de testar a aplicação antes de existir um projecto Supabase, e o adaptador
local é o que permite develop sem infraestrutura. O adaptador Supabase é o caminho
de produção; o local fica para testes e desenvolvimento.

## Regra dos dados

Nenhum dado inventado é apresentado como real. Os perfis de exemplo têm
`exemplo: true`, levam o selo «Exemplo» e o botão de WhatsApp está desactivado.
Os números de telefone dos exemplos são espaços reservados.

## Limitações conhecidas

1. **Modo local é de um só dispositivo.** Perfis criados num telemóvel não aparecem
   noutro. A interface diz isto em todas as páginas.
2. **Sem autenticação.** Qualquer pessoa cria um perfil; não há conta nem posse.
   É a próxima peça a construir, antes de qualquer utilizador real.
3. **Sem pesquisa no servidor em escala.** Os perfis são lidos de uma vez e filtrados
   em memória. Correto e instantâneo até algumas centenas; depois passa a SQL.
4. **Sem limite de frequência no registo de contactos.** Ver o comentário na migração.

## Incremento 2 — o produto passa a ter dois lados

O âmbito deixou de ser «directório de profissionais». O SALU tem agora dois percursos,
porque um marketplace com um só lado não é um marketplace.

### Decisões novas

**Sessão de demonstração em vez de autenticação.** O visitante escolhe «quero trabalhar»
ou «preciso de um serviço» e escreve o nome. Não há palavra-passe, verificação nem SMS.
A interface diz «sessão de demonstração» em vez de fingir segurança. Isto permite ao
jurado percorrer os dois lados em dois minutos, que é o objectivo do protótipo.

**Categorias planas, doze, cobrindo trabalho manual e digital.** Um designer e um
canalizador têm o mesmo problema — serem encontrados — e a mesma solução. Subcategorias
só quando houver utilizadores que as peçam.

**`contact_events` passou a apontar para perfis *ou* pedidos.** É a métrica que diz qual
dos lados está a puxar o mercado. Sem ela, «30 contactos» não indica se o produto está a
funcionar como directório ou como mural.

**Fotografias comprimidas no dispositivo.** Redimensiona para 1000 px e converte para
JPEG a 72%: uma fotografia de telemóvel passa de megabytes para ~80 KB. Sem isto, três
fotografias esgotavam o armazenamento local. O limite de 8 MB e o tipo de ficheiro são
validados antes de tocar na memória.

**Dois adaptadores actualizados em paralelo.** O SQL do incremento 2 foi escrito a par do
adaptador Supabase, para a produção não divergir do protótipo. Nenhum dos dois foi
executado — está registado como não verificado.

### O que ficou deliberadamente de fora

Autenticação real, avaliações, denúncias, notificações, pagamentos, mapas, pesquisa no
servidor. Cada uma destas peças só faz sentido depois de alguém usar os dois percursos.

### Risco assumido

O protótipo guarda tudo num dispositivo. Um jurado que abra o site no telemóvel dele vê
os dados de demonstração, mas não vê o que outro visitante criou. A interface diz isso.
É a limitação mais séria da demonstração e a primeira coisa a resolver se houver tempo
antes do dia 28.
