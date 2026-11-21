import { initDatabase } from './db.ts';
import { createApp } from './app.ts';

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '0.0.0.0';

initDatabase();

const app = createApp();
const server = app.listen(PORT, HOST, () => {
  console.log(`SALU API em http://${HOST}:${PORT}`);
  console.log('Autenticação por sessão em cookie HttpOnly; sem bots; sem escrow simulado.');
});

function shutdown(signal: string) {
  console.log(`A encerrar (${signal})...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
