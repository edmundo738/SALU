// Fallback explícito para deploys estáticos sem API configurada.
// Sem isto, um POST para /api no Netlify pode cair no 404 genérico,
// que o browser mostra como "HTTP_404" em vez de uma falha de configuração.
export const config = { path: '/api/*' };

export default async function handler(): Promise<Response> {
  return new Response(
    JSON.stringify({
      error: 'API do SALU não configurada neste deploy. Define VITE_API_URL para a API persistente.',
    }),
    {
      status: 503,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    },
  );
}
