# Publicar na Vercel

O protótipo é um site estático com rotas do lado do cliente. Precisa de uma regra que
devolva `index.html` em qualquer endereço — sem ela, abrir `/pedidos/abc` directamente
dá erro 404. Essa regra está em `vercel.json`.

## Antes de publicar

```bash
npm run build     # tem de terminar sem erros
npm test          # 43 testes
```

O `dist/` é o que vai para produção. Não é preciso commitá-lo.

## Publicar

**Pela interface (recomendado, 3 minutos)**

1. Em [vercel.com/new](https://vercel.com/new), escolher *Import Git Repository* e o
   repositório `edmundo738/SALU`. Se ainda não estiver lá, é preciso primeiro
   `git push origin main`.
2. A Vercel detecta Vite. Confirmar:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Não** definir variáveis de ambiente para a demonstração. Sem elas a aplicação
   arranca em modo demonstração, que é o comportamento pretendido no concurso.
4. Deploy. O endereço fica do tipo `salu-xxxx.vercel.app`.

**Pela linha de comandos**

```bash
npx vercel --prod
```

## Depois de publicar — verificação obrigatória

Abrir no telemóvel, não no portátil:

1. A página inicial abre e mostra os profissionais de exemplo.
2. Abrir um perfil directamente pelo endereço (`/perfil/exemplo-reparacoes`) e recarregar
   a página. Se der 404, a regra de reescrita não está a ser aplicada.
3. Publicar um pedido e confirmar que ele aparece no mural.
4. Confirmar que esse pedido mostra «O teu pedido está publicado» e **não** um botão de
   WhatsApp.

## O que a Vercel não resolve

O protótipo guarda os dados no `localStorage` do visitante. Cada pessoa que abre o
endereço vê os dados de exemplo e as suas próprias criações — **não vê o que outra pessoa
criou**. Publicar na Vercel torna o produto acessível, não partilhado.

Para haver dados entre dispositivos é preciso Supabase e autenticação, que estão fora do
âmbito desta fase.
