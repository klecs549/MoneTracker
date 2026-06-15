import { and, eq, sum } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { tags, transactions } from '../db/schema';
import { authenticate, AuthRequest } from '../lib/middleware';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const { userId } = req as AuthRequest;

  const [byTag, [{ total }]] = await Promise.all([
    db
      .select({
        tagId: transactions.tagId,
        tagName: tags.name,
        tagIcon: tags.icon,
        sum: sum(transactions.amount),
      })
      .from(transactions)
      .leftJoin(tags, eq(transactions.tagId, tags.id))
      .where(eq(transactions.userId, userId))
      .groupBy(transactions.tagId, tags.name, tags.icon),
    db
      .select({ total: sum(transactions.amount) })
      .from(transactions)
      .where(eq(transactions.userId, userId)),
  ]);

  res.json({ total: total ?? '0', byTag });
});

router.get('/list', async (req, res) => {
  const { userId } = req as AuthRequest;
  const result = await db.select().from(tags).where(eq(tags.userId, userId));
  res.json(result);
});

router.post('/', async (req, res) => {
  const { userId } = req as AuthRequest;
  const { name, icon } = req.body;
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const [tag] = await db.insert(tags).values({ userId, name, icon }).returning();
  res.status(201).json(tag);
});

router.patch('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  const patch: { name?: string; icon?: string | null } = {};
  if (req.body.name !== undefined) patch.name = req.body.name;
  if (req.body.icon !== undefined) patch.icon = req.body.icon;

  const [updated] = await db.update(tags).set(patch).where(eq(tags.id, id)).returning();
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const { userId } = req as AuthRequest;
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: 'Invalid id' }); return; }

  const [existing] = await db.select().from(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }

  await db.delete(tags).where(eq(tags.id, id));
  res.json({ message: 'Deleted' });
});

export default router;
