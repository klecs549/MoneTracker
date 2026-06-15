import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { transactions } from '../db/schema';
import { authenticate, AuthRequest } from '../lib/middleware';

const router = Router();
router.use(authenticate);

router.get('/spending-over-time', async (req, res) => {
  const { userId } = req as AuthRequest;
  const period = (req.query.period as string) || 'month';

  const now = new Date();
  let startDate: Date;
  let groupExpr: ReturnType<typeof sql>;
  let format: string;

  if (period === 'week') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    groupExpr = sql`DATE(${transactions.date})`;
    format = 'day';
  } else if (period === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    groupExpr = sql`DATE_TRUNC('month', ${transactions.date})`;
    format = 'month';
  } else {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    groupExpr = sql`DATE(${transactions.date})`;
    format = 'day';
  }

  const rows = await db
    .select({
      label: groupExpr,
      income: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} > 0 THEN ${transactions.amount} ELSE 0 END), 0)`,
      expense: sql<string>`COALESCE(SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), gte(transactions.date, startDate)))
    .groupBy(groupExpr)
    .orderBy(groupExpr);

  res.json({ period, format, data: rows });
});

export default router;
