# Publicar a API de graça (Alwaysdata)

> Depois de a API responder, a ligação ao site está explicada em **`docs/VINCULAR_SITE_API.md`** (só uma variável no Netlify).

> **Não precisas de cartão nem de pagar nada.** O Alwaysdata tem um plano gratuito para uso pessoal: 1 GB de disco, 256 MB de RAM e Node.js. A API e a base de dados SQLite ficam no mesmo sítio, por isso as contas não desaparecem quando o site é actualizado.

## O que é a API, em uma frase

A API é a parte do SALU que **guarda as contas, pedidos, propostas e mensagens**. O Netlify mostra as páginas; sem a API, o botão “Criar conta” não tem onde gravar os dados.

O programa da API **já está neste repositório**. Só falta colocá-lo a correr num sítio que fique ligado.

## Antes de começar

Precisas de:

- uma conta gratuita no Alwaysdata;
- acesso ao painel do Netlify (onde o site já está);
- 15 a 30 minutos.

Não precisas de saber programar. Vais copiar e colar comandos.

## Passo 1 — Criar a conta gratuita

1. Abre **https://www.alwaysdata.com/en/register/?p=2012**
2. Escolhe um nome de conta curto, por exemplo `salu-ao`. O endereço ficará `salu-ao.alwaysdata.net`.
3. Usa o teu e-mail e uma palavra-passe que não uses noutro sítio.
4. Confirma o e-mail.
5. Não escolhas nenhum plano pago. O plano **Free** é suficiente.

> O Alwaysdata free é para uso pessoal. Se o SALU for uma empresa, o plano gratuito não serve para produção comercial.

## Passo 2 — Ligar o SSH

O SSH é só uma forma de entrar no servidor para instalar a API.

1. No painel do Alwaysdata, abre **Remote access → SSH/SFTP**.
2. Confirma o utilizador SSH e define/activa a palavra-passe.
3. Se aparecer “Password-based login”, activa.

Guarda o endereço parecido com:

```text
ssh-<conta>.alwaysdata.net
```

Não envies a palavra-passe a ninguém, incluindo a mim.

## Passo 3 — Criar o site Node.js

No painel do Alwaysdata:

1. Abre **Web → Sites → Add a site**.
2. Tipo: **Node.js**.
3. Endereço: `<conta>.alwaysdata.net`.
4. Versão de Node.js: **22** (ou a mais recente 22.x).
5. Working directory: `salu`
6. Command:

```text
node --experimental-strip-types server/index.ts
```

7. Environment (uma variável por linha):

```text
NODE_ENV=production
APP_ORIGIN=https://salu-ao.netlify.app
SALU_DATA_DIR=/home/<conta>/salu-data
SALU_ADMIN_TOKEN=<UM_SEGREDO_LONGO>
```

Para gerar o segredo, podes usar o telemóvel/computador em **https://random.org/strings/** ou inventar uma frase longa e aleatória com letras e números. Não uses `123456`.

8. Guarda o site.

## Passo 4 — Instalar a API

Abre o terminal do teu computador (ou o terminal web do Alwaysdata) e entra:

```bash
ssh <conta>@ssh-<conta>.alwaysdata.net
```

Depois copia estes comandos, um bloco de cada vez:

```bash
cd ~
git clone https://github.com/edmundo738/SALU.git salu
cd salu
npm ci --omit=dev
mkdir -p ~/salu-data
```

Se `git` não existir, usa o **File manager** do Alwaysdata para carregar o projeto e depois corre apenas `npm ci --omit=dev` dentro da pasta `salu`.

No fim, testa:

```bash
node --experimental-strip-types server/index.ts
```

Deve aparecer uma linha parecida com:

```text
SALU API em http://...
```

Carrega em `Ctrl+C` para parar; o site do Alwaysdata volta a arrancar a API sozinho.

## Passo 5 — Confirmar que a API responde

Abre no browser:

```text
https://<conta>.alwaysdata.net/api/health
```

Deves ver:

```json
{ "status": "ok", "service": "SALU API", "storage": "sqlite" }
```

Se vires erro 502/503, no painel do Alwaysdata abre **Web → Sites → o teu site → Logs** e copia a última linha do erro. Não publiques o site público enquanto este passo falhar.

## Passo 6 — Ligar o Netlify à API

1. Abre o painel do Netlify do site `salu-ao`.
2. **Site configuration → Environment variables**.
3. Adiciona:

```text
VITE_API_URL=https://<conta>.alwaysdata.net/api
```

4. Vai a **Deploys → Clear cache and deploy site**.

## Passo 7 — Teste real

1. Abre `https://salu-ao.netlify.app/criar-conta`.
2. Cria uma conta.
3. Cria uma segunda conta noutra janela.
4. Publica um pedido, envia uma proposta e aceita.
5. Recarrega a página e confirma que os dados continuam lá.

Se o registo continuar a falhar, o problema está entre o Netlify e a API. Nesse caso, envia-me:

- o endereço `https://<conta>.alwaysdata.net/api/health`;
- o texto do erro que aparece;
- uma captura do ecrã.

## Limites do plano gratuito

- **1 GB** de disco: suficiente para começar, mas as fotografias ocupam espaço.
- **256 MB** de RAM: evita carregar imagens enormes.
- É para **uso pessoal**. Para uso comercial, o Alwaysdata tem planos pagos.
- Faz cópia de segurança de `~/salu-data/salu.db` de vez em quando.
- O SALU não processa pagamentos; esta API guarda apenas os dados do serviço.

## Se algo falhar

- **502/503 no `/api/health`**: vê os logs do site no Alwaysdata e confirma a versão Node 22.
- **`Cannot find module`**: corre outra vez `npm ci --omit=dev` dentro de `~/salu`.
- **`SQLITE_CANTOPEN`**: confirma que `SALU_DATA_DIR=/home/<conta>/salu-data` existe.
- **Login não fica guardado**: confirma que o site é HTTPS e que `NODE_ENV=production` está definido.
- **CORS**: o código já autoriza `*.netlify.app`; se usares outro domínio, adiciona-o em `APP_ORIGIN`.

## Custo

O plano Free do Alwaysdata custa **0 €**. Não é necessário cartão. O Netlify que já usas também tem plano gratuito. Não há cobrança automática neste guia.
