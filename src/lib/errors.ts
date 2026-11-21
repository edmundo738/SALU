import { ApiError } from './api';
import type { MessageKey } from '../i18n';

const english: Record<string, string> = {
  'É necessário iniciar sessão.': 'Please log in.',
  'Contacto ou palavra-passe incorretos.': 'Wrong contact or password.',
  'Já existe uma conta com este contacto.': 'An account with this contact already exists.',
  'Indica o teu nome completo.': 'Enter your full name.',
  'Indica um e-mail válido ou um número angolano (9 dígitos).':
    'Enter a valid email or an Angolan phone number (9 digits).',
  'A palavra-passe precisa de 8 caracteres, com letras e números.':
    'The password needs 8 characters, with letters and numbers.',
  'As palavras-passe não coincidem.': 'Passwords do not match.',
  'Contacto e palavra-passe são obrigatórios.': 'Contact and password are required.',
  'Escolhe como queres usar o SALU.': 'Choose how you want to use SALU.',
  'Escolhe província, município e comuna.': 'Choose province, municipality and commune.',
  'Localização inválida. Escolhe província, município e comuna.':
    'Invalid location. Choose province, municipality and commune.',
  'Nome inválido.': 'Invalid name.',
  'Idioma inválido.': 'Invalid language.',
  'Tema inválido.': 'Invalid theme.',
  'Modo inválido.': 'Invalid mode.',
  'Nada para actualizar.': 'Nothing to update.',
  'Palavra-passe actual incorrecta.': 'Current password is incorrect.',
  'Confirma a tua palavra-passe para eliminar a conta.': 'Confirm your password to delete the account.',
  'Escolhe um ficheiro.': 'Choose a file.',
  'Tipo de ficheiro inválido.': 'Invalid file type.',
  'Formato não aceite. Usa JPG, PNG, WebP ou PDF.': 'Unsupported format. Use JPG, PNG, WebP or PDF.',
  'PDF só é aceite como documento privado (anexo ou prova).': 'PDF is only accepted as a private document.',
  'Fotografia inválida.': 'Invalid photo.',
  'Perfil não encontrado.': 'Profile not found.',
  'Escreve um título profissional (5–120 caracteres).': 'Write a professional headline (5–120 characters).',
  'Escolhe uma categoria válida.': 'Choose a valid category.',
  'Escreve uma apresentação com pelo menos 20 caracteres.': 'Write an about section with at least 20 characters.',
  'Indica os anos de experiência (0–70).': 'Enter years of experience (0–70).',
  'WhatsApp deve ser um número angolano.': 'WhatsApp must be an Angolan number.',
  'Define primeiro a tua localização nas definições.': 'Set your location in settings first.',
  'Cria o teu perfil profissional antes de publicar.': 'Create your provider profile before publishing.',
  'Completa o perfil antes de publicar.': 'Complete the profile before publishing.',
  'Cria o perfil profissional antes de adicionar trabalhos.': 'Create the provider profile before adding work.',
  'O portefólio aceita no máximo 8 imagens.': 'The portfolio accepts up to 8 images.',
  'Pedido não encontrado.': 'Request not found.',
  'Não tens acesso a este pedido.': 'You do not have access to this request.',
  'Só o autor pode editar o pedido.': 'Only the author can edit the request.',
  'Só podes editar pedidos ainda abertos.': 'You can only edit requests that are still open.',
  'Só o autor pode cancelar o pedido.': 'Only the author can cancel the request.',
  'Este pedido já tem um acordo.': 'This request already has an agreement.',
  'Não podes propor ao teu próprio pedido.': 'You cannot propose on your own request.',
  'Este pedido já não está aberto.': 'This request is no longer open.',
  'Publica o teu perfil profissional antes de enviar propostas.':
    'Publish your provider profile before sending proposals.',
  'Indica um valor em kwanzas.': 'Enter an amount in kwanzas.',
  'Indica um prazo entre 1 e 365 dias.': 'Enter a deadline between 1 and 365 days.',
  'Escreve uma mensagem com pelo menos 10 caracteres.': 'Write a message with at least 10 characters.',
  'Já enviaste uma proposta para este pedido.': 'You already sent a proposal for this request.',
  'Só o autor do pedido pode aceitar propostas.': 'Only the request author can accept proposals.',
  'Esta proposta já não está pendente.': 'This proposal is no longer pending.',
  'Só o autor do pedido pode recusar propostas.': 'Only the request author can reject proposals.',
  'Só o autor pode retirar a proposta.': 'Only the author can withdraw the proposal.',
  'Acordo não encontrado.': 'Agreement not found.',
  'Este acordo já não está pendente de aceitação.': 'This agreement is no longer waiting for acceptance.',
  'Já confirmaste este acordo.': 'You already confirmed this agreement.',
  'Não participas neste acordo.': 'You are not part of this agreement.',
  'Só o prestador pode recusar este acordo.': 'Only the provider can decline this agreement.',
  'Este acordo já não está pendente.': 'This agreement is no longer pending.',
  'Só o prestador pode submeter a conclusão.': 'Only the provider can submit completion.',
  'O acordo não está activo.': 'The agreement is not active.',
  'Descreve o trabalho concluído (mínimo 10 caracteres).': 'Describe the completed work (at least 10 characters).',
  'Só o cliente pode confirmar a conclusão.': 'Only the customer can confirm completion.',
  'O prestador ainda não submeteu a conclusão.': 'The provider has not submitted completion yet.',
  'Só o cliente pode pedir correcções.': 'Only the customer can request changes.',
  'Não há conclusão por confirmar.': 'There is no completion to confirm.',
  'Explica o que precisa de ser corrigido.': 'Explain what needs to be fixed.',
  'Este acordo não pode entrar em disputa.': 'This agreement cannot be disputed.',
  'Explica o motivo da disputa.': 'Explain the reason for the dispute.',
  'Só podes cancelar um acordo antes de começar.': 'You can only cancel an agreement before it starts.',
  'Só podes avaliar depois da conclusão confirmada.': 'You can only review after completion is confirmed.',
  'Já avaliaste este serviço.': 'You already reviewed this service.',
  'Não podes avaliar-te a ti próprio.': 'You cannot review yourself.',
  'As três notas são obrigatórias (1 a 5).': 'All three ratings are required (1 to 5).',
  'Conversa não encontrada.': 'Conversation not found.',
  'Conversa privada.': 'Private conversation.',
  'Escreve uma mensagem ou anexa um ficheiro.': 'Write a message or attach a file.',
  'Tipo de denúncia inválido.': 'Invalid report type.',
  'Indica o alvo e o motivo da denúncia.': 'Provide the target and reason for the report.',
  'Descreve o que aconteceu (mínimo 10 caracteres).': 'Describe what happened (at least 10 characters).',
  'Anexa um documento.': 'Attach a document.',
  'Escolhe o tipo de verificação.': 'Choose the verification type.',
  'Já tens um pedido de verificação em análise.': 'You already have a verification request under review.',
  'Documento inválido.': 'Invalid document.',
  'O ficheiro excede 6 MB.': 'The file exceeds 6 MB.',
  'Usa JPG, PNG, WebP ou PDF.': 'Use JPG, PNG, WebP or PDF.',
  'Demasiados pedidos. Tenta novamente daqui a pouco.': 'Too many requests. Try again shortly.',
  'Erro interno. Tenta novamente.': 'Internal error. Try again.',
  'Só podes recorrer depois de a denúncia ser resolvida.': 'You can only appeal after the report is resolved.',
  'Explica porque queres recorrer (mínimo 20 caracteres).': 'Explain why you want to appeal (at least 20 characters).',
  'Já tens um recurso em análise.': 'You already have an appeal under review.',
  'Denúncia não encontrada.': 'Report not found.',
  'Recurso não encontrado.': 'Appeal not found.',
  'Este recurso já foi revisto.': 'This appeal has already been reviewed.',
  'Estado inválido.': 'Invalid state.',
  'Imagem inválida ou demasiado grande. Usa JPG, PNG ou WebP.': 'Invalid or too large image. Use JPG, PNG or WebP.',
  'Imagem inválida.': 'Invalid image.',
  'O ficheiro excede o limite de 6 MB.': 'The file exceeds the 6 MB limit.',
  'Não foi possível ler o ficheiro.': 'Could not read the file.',
  'Origem não autorizada.': 'Origin not allowed.',
  'Rota não encontrada.': 'Route not found.',
  'Não encontrado.': 'Not found.',
  'Indica um alvo válido.': 'Provide a valid target.',
};

export function friendlyError(error: unknown, lang: 'pt' | 'en', t: (key: MessageKey) => string): string {
  if (error instanceof ApiError) {
    if (
      error.status === 0 ||
      error.message === 'NETWORK_ERROR' ||
      error.message === 'API_NOT_JSON' ||
      error.status === 502
    )
      return t('common.networkError');
    if (error.status === 401 && error.message.includes('iniciar sessão')) return t('common.sessionExpired');
    if (lang === 'en') return english[error.message] || error.message;
    return error.message;
  }
  return t('common.somethingWrong');
}
