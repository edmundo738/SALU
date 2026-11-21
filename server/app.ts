import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { apiRouter } from './api.ts';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];

function envOrigins(): string[] {
  return (process.env.APP_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function originAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // curl, testes e pedidos same-origin sem Origin
  if (DEV_ORIGINS.includes(origin) || envOrigins().includes(origin)) return true;
  // Preview do Arena e deploys de pré-visualização Netlify.
  if (/^https:\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.e2b\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+(--[a-z0-9-]+)?\.netlify\.app$/i.test(origin)) return true;
  return false;
}

const buckets = new Map<string, { count: number; reset: number }>();

function rateLimit(windowMs: number, max: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = `${req.ip}|${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.reset < now) {
      buckets.set(key, { count: 1, reset: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.reset - now) / 1000)));
      return res.status(429).json({ error: 'Demasiados pedidos. Tenta novamente daqui a pouco.' });
    }
    next();
  };
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) if (bucket.reset < now) buckets.delete(key);
}, 60_000).unref();

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  app.use(
    cors({
      origin(origin, callback) {
        if (originAllowed(origin)) return callback(null, true);
        return callback(new Error('Origem não autorizada.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Admin-Token'],
    }),
  );

  // Defesa CSRF adicional: cookies HttpOnly + verificação de Origin em mutações.
  app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (origin && !originAllowed(origin)) {
      return res.status(403).json({ error: 'Origem não autorizada.' });
    }
    next();
  });

  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: false, limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'SALU API',
      timestamp: new Date().toISOString(),
      storage: 'sqlite',
    });
  });

  app.use('/api/auth', rateLimit(60_000, 20));
  app.use('/api', rateLimit(60_000, 300), apiRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'O ficheiro excede o limite de 6 MB.' });
      }
      return res.status(400).json({ error: 'Não foi possível ler o ficheiro.' });
    }
    if (err?.message === 'Origem não autorizada.') {
      return res.status(403).json({ error: 'Origem não autorizada.' });
    }
    console.error('[SALU API]', err);
    return res.status(500).json({ error: 'Erro interno. Tenta novamente.' });
  });

  return app;
}
