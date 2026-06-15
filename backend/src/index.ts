import 'dotenv/config';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { db } from './db';
import authRouter from './routes/auth';
import analyticsRouter from './routes/analytics';
import borrowingRouter from './routes/borrowing';
import tagsRouter from './routes/tags';
import transactionsRouter from './routes/transactions';
import { sql } from 'drizzle-orm';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/borrowing', borrowingRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
