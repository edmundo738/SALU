# Como ligar o site à API (sem código)

> **Actualização importante:** as instruções antigas abaixo sobre o `git pull` ser opcional e sobre as alternativas de fotos nunca falharem estão desactualizadas. O site Netlify e a API alwaysdata são actualizados separadamente. Antes de qualquer actualização da API, confirmar a pasta e versão efectivamente usadas, preservar a base e os uploads e testar o restauro. Não editar ficheiros à mão nem executar comandos que apaguem dados. A API instalada e o resultado em produção precisam de verificação.

## A ideia em 30 segundos

Imagina:

- **Netlify** = a loja, onde as pessoas vêem as páginas.
- **Alwaysdata** = o arquivo, onde ficam guardadas as contas, pedidos e mensagens.
- **API** = a porta do arquivo.

O site precisa de saber **o endereço da porta do arquivo**. É só isso que vamos ligar.

```text
Telemóvel / computador
        │
        ├── abre as páginas em:  https://salu-ao.netlify.app
        │
        └── grava os dados em:   https://<conta>.alwaysdata.net/api
```

Não se instala nada no Netlify. Não se paga nada. Apenas se escreve o endereço da API numa caixa de configuração.

## Antes de ligar: ter a API a responder

No guia `docs/DEPLOY_GRATIS.md`, primeiro tens de chegar a este resultado:

```text
https://<conta>.alwaysdata.net/api/health
```

E ver:

```json
{ "status": "ok", "service": "SALU API", "storage": "sqlite" }
```

Se este endereço ainda não mostrar `ok`, **não continues**: o problema está na API, não no Netlify.

## O endereço que vais copiar

Se a tua conta no Alwaysdata for, por exemplo, `salu-ao`, o endereço é:

```text
https://salu-ao.alwaysdata.net/api
```

Repara que termina em **`/api`**. É este o valor que o site precisa.

## Onde colar no Netlify

1. Abre **https://app.netlify.com**
2. Entra no site **salu-ao**.
3. Abre **Site configuration** (Configuração do site).
4. No menu lateral, escolhe **Environment variables** (Variáveis de ambiente).
5. Carrega em **Add a variable** (Adicionar variável).
6. Preenche:

```text
Key:    VITE_API_URL
Value:  https://salu-ao.alwaysdata.net/api
```

7. Guarda.

## O passo que quase todos esquecem

O Netlify precisa de **voltar a construir o site** para ler a nova variável.

1. Abre **Deploys**.
2. Carrega em **Trigger deploy**.
3. Escolhe **Clear cache and deploy site**.

Espera acabar. Não basta guardar a variável.

## Como saber se ficou ligado

1. Abre `https://salu-ao.netlify.app/criar-conta`.
2. Cria uma conta de teste.
3. Se entrares no onboarding, **está ligado**.
4. Se aparecer “Serviço temporariamente indisponível”, ainda não está.

Também podes abrir no computador:

```text
https://salu-ao.netlify.app/api/health
```

Atenção: este último endereço pertence ao Netlify, não ao Alwaysdata. O teste correcto da API é o do Alwaysdata:

```text
https://<conta>.alwaysdata.net/api/health
```

## Tabela de erros

| O que vês                                | O que significa                              | O que fazer                                           |
| ---------------------------------------- | -------------------------------------------- | ----------------------------------------------------- |
| “Serviço temporariamente indisponível”   | O site não encontrou a API                   | Confirmar `VITE_API_URL` e fazer Clear cache deploy   |
| `HTTP_404`                               | O site ainda está a tentar gravar no Netlify | Falta a variável ou falta o redeploy                  |
| `502` / `503` no health                  | A API não arrancou no Alwaysdata             | Ver os logs do site no Alwaysdata                     |
| A API responde `ok`, mas o registo falha | Endereço errado, sem `/api`, ou CORS         | Confirmar o valor exacto de `VITE_API_URL`            |
| Registo funciona mas o login perde-se    | Cookie bloqueado                             | Confirmar HTTPS e `NODE_ENV=production` no Alwaysdata |

## O que não precisas de fazer

- Não precisas de mexer no código.
- Não precisas de comprar domínio.
- Não precisas de cartão.
- Não precisas de instalar nada no telemóvel.

## Se te bloqueares

Envia uma captura com:

1. o resultado de `https://<conta>.alwaysdata.net/api/health`;
2. o ecrã do Netlify onde está a variável `VITE_API_URL`;
3. o erro que aparece ao criar conta.

Com esses três, consigo dizer exactamente qual dos lados está errado.

---

# Automatizar: GitHub → Netlify

O site actual foi publicado por **Netlify Drop**. Para cada alteração no GitHub aparecer sozinha no site, liga o projeto actual ao repositório. **Não precisas de criar um site novo** — o endereço `salu-ao.netlify.app` mantém-se.

## Antes de ligar

Confirma em **Project configuration → Environment variables** que existe:

```text
VITE_API_URL=https://edmundo.alwaysdata.net/api
```

## Ligar o repositório

1. No Netlify, abre o projeto **salu-ao**.
2. **Project configuration**.
3. **Developer settings**.
4. **Continuous deployment → Repository**.
5. Clica em **Link repository**.
6. Escolhe **GitHub**.
7. Autoriza a app do Netlify no GitHub, se pedir.
8. Escolhe o repositório `edmundo738/SALU`.
9. Branch de produção: `main`.
10. Confirma.

O `netlify.toml` já diz ao Netlify o que fazer:

```text
Build command: npm run build
Publish directory: dist
Node: 22
```

Não precisas de preencher esses campos à mão; o ficheiro já está no repositório.

## O que passa a acontecer

- Cada **push/merge para `main`** faz build e publica automaticamente.
- Cada **pull request** ganha um preview próprio.
- Já não precisas de arrastar ZIPs.
- Se o build falhar, o site actual continua online e o Netlify mostra o erro em **Deploys**.

## Primeiro deploy

1. Depois de ligar, abre **Deploys**.
2. Se não começar sozinho, clica em **Trigger deploy → Deploy site**.
3. Espera por **Published**.
4. Testa `https://salu-ao.netlify.app/criar-conta`.

Se o build falhar por causa de `VITE_API_URL`, confirma que a variável existe e repete **Trigger deploy → Clear cache and deploy site**.

## Coisa importante

O Netlify só publica o que está na branch **`main`**. Alterações em branches abertas (como a `arena/a3cf2ae7-salu`) não aparecem no site até serem merged.

# Se as fotografias não aparecerem

Sintoma: escolhes uma foto, o upload termina com sucesso ("feito"), mas a imagem
nunca aparece — fica o espaço vazio ou as iniciais.

Causa: a foto fica guardada no servidor da API (`edmundo.alwaysdata.net`) e era
mostrada dentro da página do Netlify (`salu-ao.netlify.app`). São dois domínios
diferentes e o browser recusa carregar imagens vindas de outro domínio sem
permissão explícita. O upload sempre esteve certo; faltava a permissão de leitura.

## Como está resolvido agora

O site não pede mais a imagem ao outro domínio. Pede ao **seu próprio domínio**,
e o Netlify vai buscá-la:

```text
Página:  https://salu-ao.netlify.app/pedidos/req_123
Imagem:  https://salu-ao.netlify.app/media/file_abc123     ← mesmo domínio
Netlify: reescreve para https://edmundo.alwaysdata.net/api/files/file_abc123
```

A regra está no **topo** de `public/_redirects`:

```text
/media/*    https://edmundo.alwaysdata.net/api/files/:splat   200!
```

Este ficheiro é processado **antes** do `netlify.toml`. Se a regra ficar no
`netlify.toml`, o `/*  /index.html  200` do fim do `_redirects` ganha primeiro e
a imagem nunca chega a ser pedida — foi exactamente o que aconteceu na primeira
tentativa. O `!` no fim significa "força", mesmo que exista um ficheiro no caminho.

Como o caminho tem um `#` (o `#` é comentário), a regra tem de estar numa linha
própria, antes de qualquer regra genérica.

`status = 200` significa reescrita (proxy), não redireccionamento: o endereço na
barra do browser não muda e o ficheiro chega ao browser como se fosse do site.

Ficheiros privados (anexos de conversa, provas de conclusão) não podem ser
públicos. Esses são lidos pelo cliente com a sessão e mostrados a partir de
memória (`src/components/FileImage.tsx`), por isso também funcionam.

## Segunda rede de segurança

Mesmo que a regra do proxy desapareça (por exemplo, um build sem `public/_redirects`),
as imagens continuam a aparecer: o componente `FileImage` lê os bytes com a sessão
por `fetch` (pedido CORS, que não sofre das restrições de imagem entre domínios) e
mostra-os a partir de memória. Esta alternativa depende da rede e da configuração de origens e também pode falhar.

## O que ainda vale a pena fazer no servidor

O `server/api.ts` já responde `Cross-Origin-Resource-Policy: cross-origin` em
`GET /files/:id`. Isso permite abrir um ficheiro directamente no separador novo,
sem passar pelo proxy. Para o servidor do alwaysdata correr esse código:

```bash
cd ~/salu
git pull
```

Depois, no painel: **Web → Sites → ⚙ → Restart**. Pode ser necessário para que correcções da API entrem em funcionamento; confirmar primeiro a pasta e a versão efectivas.

## Estado

Confirmado em produção a 2026-11-22: a fotografia aparece no site depois do deploy
de `main`. Se voltar a falhar, começar pelo teste de 10 segundos de `/media/teste`
descrito abaixo.

## Como confirmar

1. Abre uma foto qualquer no site e clica nela (abre em separador novo).
2. O endereço deve começar por `https://salu-ao.netlify.app/media/`.
3. Se a imagem abrir, está tudo certo. Se der 404, o proxy não chegou a publicar:
   confirma em **Deploys** que o build passou e volta a publicar.
