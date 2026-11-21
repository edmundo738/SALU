import { describe, expect, it } from 'vitest';
import { ApiError } from '../src/lib/api';
import { friendlyError } from '../src/lib/errors';

const t = (key: string) => key;

describe('friendlyError', () => {
  it('traduz um 404 sem corpo JSON numa falha de API, não em HTTP_404', () => {
    expect(friendlyError(new ApiError('HTTP_404', 404), 'pt', t)).toBe('common.apiUnavailable');
  });

  it('não confunde credenciais erradas com sessão expirada', () => {
    expect(friendlyError(new ApiError('Contacto ou palavra-passe incorretos.', 401), 'pt', t)).toBe(
      'Contacto ou palavra-passe incorretos.',
    );
  });

  it('continua a sinalizar sessão expirada quando o servidor o diz', () => {
    expect(friendlyError(new ApiError('É necessário iniciar sessão.', 401), 'pt', t)).toBe('common.sessionExpired');
  });

  it('traduz erros de rede conhecidos', () => {
    expect(friendlyError(new ApiError('NETWORK_ERROR', 0), 'en', t)).toBe('common.networkError');
  });
});
