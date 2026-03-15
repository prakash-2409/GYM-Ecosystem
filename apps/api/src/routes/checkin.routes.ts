import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as checkinService from '../services/checkin.service';
import prisma from '@gymstack/db';
import { env } from '../config/env';

const router = Router();
router.use(authenticate, gymContext);

// ─── Kiosk check-in (receptionist) ────────────────────
router.post('/', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const { memberCode } = req.body;
    const result = await checkinService.checkIn(memberCode, req.gymId!);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ─── QR check-in (mobile app) ─────────────────────────
router.post('/qr', async (req: Request, res: Response) => {
  try {
    const { gymId, hash } = req.body;
    if (!gymId || !hash) {
      res.status(400).json({ error: 'gymId and hash are required' });
      return;
    }

    // Validate HMAC — gym QR contains gymId + HMAC(gymId, secret)
    const expectedHash = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(gymId)
      .digest('hex');

    if (hash !== expectedHash) {
      res.status(403).json({ error: 'Invalid QR code' });
      return;
    }

    // Find member from authenticated user
    const member = await prisma.member.findFirst({
      where: { userId: req.user!.userId, gymId },
    });
    if (!member) {
      res.status(404).json({ error: 'Member not found for this gym' });
      return;
    }

    const result = await checkinService.checkIn(member.memberCode, gymId, 'app');
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/sync', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const { checkIns } = req.body;
    const result = await checkinService.syncOfflineCheckIns(req.gymId!, checkIns);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/today', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const checkIns = await checkinService.getTodayCheckIns(req.gymId!);
    res.json({ checkIns });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/by-date', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const date = req.query.date as string | undefined;
    const checkIns = await checkinService.getCheckInsByDate(req.gymId!, date);
    res.json({ checkIns });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
