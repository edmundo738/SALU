import express from 'express';
import cors from 'cors';
import * as path from 'node:path';
import { initDatabase } from './db.ts';
import { apiRouter } from './api.ts';
import { startBotScheduler } from './bots.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve static uploaded files (screenshots, avatars)
const uploadsPath = path.resolve(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'SALU — Serviços, Oportunidades, Confiança',
    timestamp: new Date().toISOString(),
    database: 'SQLite (Nativo Node.js)',
  });
});

// Initialize DB and start listening
try {
  initDatabase();
  startBotScheduler(240); // Runs a bot simulated action every 4 minutes

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  SALU BACKEND API OPERACIONAL EM http://127.0.0.1:${PORT}`);
    console.log(`  Base de Dados: SQLite (Nativo Node 24, Zero Dependências)`);
    console.log(`  Ficheiro: data/salu.db`);
    console.log(`=======================================================`);
  });
} catch (err: any) {
  console.error('[SALU BACKEND] Erro ao iniciar:', err);
  process.exit(1);
}
