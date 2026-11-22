# SALU — consultoria dos percursos de perfil e pedidos

## Âmbito

Revisão do código e ensaios locais dos percursos pedidos pelo dono: entrar, usar o logótipo, aceder ao perfil, alternar entre pedir e prestar serviços, e publicar um pedido com fotografias. Inclui também outras inconsistências encontradas nos mesmos fluxos. Não é uma certificação de todos os ecrãs: não houve ensaio visual em dispositivos físicos nem teste de produção nesta revisão. As alterações estão na branch de trabalho, não foram publicadas.

## O que encontrei e o que foi alterado no código

### Logótipo e sessão

- **Antes:** o logótipo apontava sempre para `/`, mesmo com sessão. A página pública continuava a oferecer registo e entrada.
- **Agora:** com sessão, o logótipo leva a `/inicio`; uma conta sem localização vai para a configuração inicial; sem sessão mantém a página pública. Se alguém com sessão abrir a página pública directamente, os botões oferecem início e, consoante o modo, oportunidades ou publicação de pedido. O título do botão do cabeçalho também corresponde ao destino.
- **Prova:** teste de interface local para conta com e sem localização; falta confirmação em browser e no site publicado.

### Perfil próprio e perfil profissional

- **Antes:** o menu apontava para definições e, em modo prestador, para o editor profissional. Não havia um acesso claro à visualização da própria conta. A API de produção observada anteriormente devolveu `avatar: null` no perfil público, embora a fotografia estivesse presente na sessão.
- **Agora:** menu da conta e menu móvel têm “O meu perfil”, que mostra a fotografia e permite alterá-la; em modo prestador oferece também “Ver perfil profissional” (quando existe) e “Editar perfil”, acções distintas. O perfil profissional próprio e o cartão próprio na pesquisa podem usar o avatar da sessão se a API do perfil não o devolver. O editor prefere a foto da conta, actualiza a sessão com a resposta do upload e não repõe os campos escritos por causa de uma actualização da conta. Uma falha ao carregar o editor apresenta erro e botão de tentativa, em vez de abrir um formulário vazio.
- **Limite importante:** o fallback da própria sessão não permite mostrar a foto a outros utilizadores. Para todos verem a fotografia, a resposta da API em produção tem de conter o avatar correcto. Confirmar a versão e a configuração do servidor antes de actualizá-lo; depois testar com uma segunda conta.
- **Portefólio:** a API exige perfil guardado antes de adicionar trabalhos. O editor explica isso e evita oferecer a operação antes de ser possível.

### Separação entre cliente e prestador

- **Modo cliente:** publicar e consultar os próprios pedidos, receber propostas e contratar.
- **Modo prestador:** encontrar pedidos abertos, enviar uma proposta a partir da lista ou do detalhe, e acompanhar as propostas, conversas e acordos. Os atalhos para publicar e consultar pedidos próprios foram retirados deste modo.
- A mudança de modo continua a ser escolhida nas definições; não é automática. Os pedidos anteriores não são apagados e continuam disponíveis no modo cliente.
- A API exclui os próprios pedidos das oportunidades e impede propor ao próprio pedido. Os filtros separados para pedidos do cliente e propostas do prestador exigem a actualização do servidor; com um servidor anterior existe filtragem de segurança na interface, mas páginas de resultados podem ficar incompletas.
- **Prova:** testes locais de interface e ciclo com contas distintas; falta validação visual e em produção.

### Fotos nos pedidos

- **Antes:** a API já devolvia as fotos na resposta do pedido e dos resultados, mas os cartões não as mostravam. O detalhe mostrava fotos apenas quando aberto. Era possível avançar enquanto o carregamento de uma imagem ainda estava em curso.
- **Agora:** o cartão apresenta a primeira fotografia junto à descrição e um contador das outras; o detalhe conserva a galeria. Antes de publicar, o resumo mostra as fotografias escolhidas. Enquanto uma foto está a ser enviada, os botões de navegação ficam indisponíveis para não avançar antes da conclusão. Uma falha de carregamento mostra uma indicação em vez de desaparecer silenciosamente. O formulário explica que as imagens de pedidos são públicas para quem tiver o endereço.
- **Prova:** teste local envia fotografia, cria pedido e verifica o mesmo ID no detalhe do dono e na lista de oportunidades; leitura do ficheiro devolve 200. Teste de interface confirma imagem e descrição no cartão. Não prova visualização nos telefones ou em produção.

### Outras inconsistências detectadas

- Corrigido espaço extra no endereço de conversa a partir de uma proposta.
- Falha ao carregar conversas no painel já não é apresentada como se não existissem mensagens.
- Campo de localização no resumo do pedido usa o nome do local, não fragmentos de IDs.
- Menu fechado não deve expor os seus links ao teclado.
- Uma pessoa sem perfil profissional publicado vê uma orientação para o publicar, em vez de ser encaminhada para um detalhe que o servidor não autoriza.

## Riscos e trabalho restante

1. **Servidor em produção:** as alterações ao servidor não são publicadas pelo Netlify. A foto para visitantes, a segurança de origem, a revogação de ficheiros e a paginação dependem de uma actualização e testes separados no alwaysdata. A versão e o directório em execução continuam por confirmar.
2. **Segurança das oportunidades:** actualmente a API de listagem de pedidos abertos aceita qualquer conta autenticada e devolve dados do pedido, mas o detalhe é mais restritivo. Nesta revisão não foi alterada a política de autorização porque isso poderia quebrar os percursos actuais; é preciso decidir quem deve poder ver o quê, alinhar listagem, detalhe e imagens, e testar acessos de terceiros.
3. **Recuperação e suporte:** não há recuperação automática verificada nem canal de suporte garantido. É necessária uma solução segura e um canal real; não inventar serviço nem custos.
4. **Segurança dos dados:** rever os dados que ficam em mensagens, anexos e cópias depois de eliminar a conta; testar backups e restauro e verificar limites do plano gratuito. Uma imagem já guardada por cache externo pode sobreviver temporariamente à revogação.
5. **Experiência real:** falta verificar Android, iPhone, computador, tema escuro, tamanhos de texto, navegação por teclado e carregamento lento. Conferir também a abertura da app instalada e as condições de actualização; o aviso só existe depois de abrir uma versão que o inclua.
6. **Contactar uma pessoa específica:** a plataforma actualmente cria a conversa a partir de uma proposta. Se o objectivo for convidar um prestador específico, é uma funcionalidade própria que exige desenho, autorização e testes; publicar pedido não é equivalente.

## Roteiro para confirmação, sem usar dados reais

1. Conta A: registar, completar localização; confirmar que o logótipo abre início. Ver “O meu perfil”, carregar foto, sair e voltar a entrar.
2. Conta A: criar perfil profissional em rascunho, adicionar trabalho, ver a página; publicar e ver noutra conta. Confirmar fotografia e portefólio.
3. Em modo cliente, publicar pedido com duas fotos; confirmar resumo, cartão e detalhe. A conta B em modo prestador confirma o pedido nas oportunidades. Testar também um pedido sem fotografia e uma imagem inválida.
4. Conta B: criar perfil publicado, enviar proposta pela lista e noutro pedido pelo detalhe; acompanhar a proposta e abrir a conversa. Conta A abre a conversa a partir do pedido, aceita proposta e acompanha o acordo. Testar também utilizador terceiro sem permissão.
5. Repetir em telemóvel e computador, com rede lenta, tema escuro, zoom e teclado. Confirmar visualmente alinhamento e que as acções têm nomes claros.
6. Só depois da verificação da instalação e do backup, coordenar publicação do frontend e do servidor. Testar produção com contas de teste e registar o resultado sem dados privados.
