const MODELOS = [
  {
    nome: 'Comissão',
    como: 'A plataforma retém uma percentagem do pagamento.',
    porque: 'Exige controlar o pagamento. Se a combinação e o pagamento acontecem no WhatsApp ou em dinheiro, não há forma fiável de cobrar.',
    escolhido: false,
  },
  {
    nome: 'Leads',
    como: 'O profissional paga para receber cada oportunidade.',
    porque: 'Faz o trabalhador pagar antes de saber se o contacto dá trabalho. Contradiz o princípio do projecto.',
    escolhido: false,
  },
  {
    nome: 'Freemium',
    como: 'Perfil e acesso às oportunidades gratuitos; ferramentas profissionais pagas.',
    porque: 'Permite que quem está a começar entre sem pagar, e cobra a quem já tem actividade.',
    escolhido: true,
  },
  {
    nome: 'Destaques patrocinados',
    como: 'Negócios pagam por espaços promocionais identificados como tal.',
    porque: 'Receita sem tocar no acesso básico. Só funciona com audiência suficiente.',
    escolhido: true,
  },
];

export function Planos() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-black sm:text-3xl">Como o SALU se sustenta</h1>
      <p className="mt-2 max-w-prose text-sm text-mute">
        Nenhum preço nesta página está decidido. Esta é a estratégia de receita que vamos
        testar — não uma promessa de facturação.
      </p>

      <div className="mt-6 rounded-2xl bg-ink p-5 text-sand">
        <p className="text-xs uppercase tracking-widest text-sand/60">Princípio</p>
        <p className="mt-2 text-lg font-bold leading-snug">
          Quem procura a primeira oportunidade nunca paga para ser visto.
        </p>
        <p className="mt-2 text-sm text-sand/70">
          Se o SALU cobrasse a quem ainda não ganhou nada, seria mais uma barreira em vez
          de uma porta.
        </p>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="cartao p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-mute">Plano actual</p>
          <h2 className="mt-1 text-xl font-black">SALU Free</h2>
          <p className="mt-1 text-2xl font-black">0 Kz</p>
          <ul className="mt-3 space-y-1.5 text-sm text-mute">
            <li>Criar perfil profissional</li>
            <li>Aparecer na pesquisa</li>
            <li>Ver e responder a pedidos</li>
            <li>Contacto por WhatsApp</li>
          </ul>
        </div>

        <div className="cartao border-forest-500/40 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-forest-600">
            A testar
          </p>
          <h2 className="mt-1 text-xl font-black">SALU Pro</h2>
          <p className="mt-1 text-sm font-medium text-mute">Preço por validar</p>
          <ul className="mt-3 space-y-1.5 text-sm text-mute">
            <li>Estatísticas de visitas e contactos</li>
            <li>Portefólio ampliado</li>
            <li>Destaque na categoria</li>
            <li>Ferramentas de gestão</li>
          </ul>
        </div>

        <div className="cartao p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-mute">
            Mais tarde
          </p>
          <h2 className="mt-1 text-xl font-black">Empresas</h2>
          <p className="mt-1 text-sm font-medium text-mute">Por negociar</p>
          <ul className="mt-3 space-y-1.5 text-sm text-mute">
            <li>Vários pedidos simultâneos</li>
            <li>Página de negócio</li>
            <li>Espaços promocionais identificados</li>
          </ul>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="seccao-titulo">Modelos que considerámos</h2>
        <p className="mt-1 text-sm text-mute">
          Escolher o que não fazer é parte da estratégia.
        </p>

        <div className="mt-3 space-y-2">
          {MODELOS.map((modelo) => (
            <div
              key={modelo.nome}
              className={`cartao p-4 ${modelo.escolhido ? 'border-forest-500/40' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`selo ${
                    modelo.escolhido
                      ? 'bg-forest-500/10 text-forest-600'
                      : 'bg-line/70 text-mute'
                  }`}
                >
                  {modelo.escolhido ? 'Escolhido' : 'Recusado'}
                </span>
                <h3 className="font-semibold">{modelo.nome}</h3>
              </div>
              <p className="mt-1.5 text-sm">{modelo.como}</p>
              <p className="mt-1 text-sm text-mute">{modelo.porque}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cartao mt-8 border-dashed p-5">
        <h2 className="font-semibold">O que ainda não sabemos</h2>
        <ul className="mt-2 space-y-1.5 text-sm text-mute">
          <li>Quanto está um profissional disposto a pagar por mês.</li>
          <li>Quantos contactos são precisos para gerar um trabalho pago.</li>
          <li>Se os destaques patrocinados prejudicam a confiança na pesquisa.</li>
        </ul>
        <p className="mt-3 text-sm text-mute">
          Estas três perguntas só se respondem com utilizadores reais. É o que o piloto
          existe para medir.
        </p>
      </section>
    </div>
  );
}
