import { getPrisma, isDbOnline } from '../db.js';
import { memoryExecutions } from './executionController.js';

export async function getHistory(req, res) {
  try {
    const userId = req.user?.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const items = await prisma.algorithmExecution.findMany({
        where: userId ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          title: true,
          language: true,
          code: true,
          input: true,
          status: true,
          stepCount: true,
          executionTimeMs: true,
          createdAt: true,
        },
      });
      return res.json({ success: true, history: items });
    }

    const filtered = userId
      ? memoryExecutions.filter((e) => e.userId === userId)
      : memoryExecutions;

    return res.json({ success: true, history: filtered });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve execution history.' });
  }
}

export async function getHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.algorithmExecution.findUnique({
        where: { id },
      });

      if (!item) {
        return res.status(404).json({ success: false, message: 'History record not found.' });
      }

      if (item.userId && userId && item.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to view this record.' });
      }

      return res.json({ success: true, record: item });
    }

    const found = memoryExecutions.find((e) => e.id === id);
    if (!found) {
      return res.status(404).json({ success: false, message: 'History record not found.' });
    }

    return res.json({ success: true, record: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve record.' });
  }
}

export async function deleteHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.algorithmExecution.findUnique({ where: { id } });
      if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });

      if (item.userId && userId && item.userId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this record.' });
      }

      await prisma.algorithmExecution.delete({ where: { id } });
      return res.json({ success: true, message: 'History record deleted.' });
    }

    const idx = memoryExecutions.findIndex((e) => e.id === id);
    if (idx !== -1) {
      memoryExecutions.splice(idx, 1);
    }
    return res.json({ success: true, message: 'History record deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
}

export async function clearHistory(req, res) {
  try {
    const userId = req.user?.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      if (userId) {
        await prisma.algorithmExecution.deleteMany({ where: { userId } });
      } else {
        await prisma.algorithmExecution.deleteMany({});
      }
      return res.json({ success: true, message: 'History cleared.' });
    }

    if (userId) {
      const remaining = memoryExecutions.filter((e) => e.userId !== userId);
      memoryExecutions.length = 0;
      memoryExecutions.push(...remaining);
    } else {
      memoryExecutions.length = 0;
    }

    return res.json({ success: true, message: 'History cleared.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear history.' });
  }
}
