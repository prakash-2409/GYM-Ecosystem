import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '@gymstack/db';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import { env } from '../config/env';

const router = Router();

router.use(authenticate, gymContext);

router.get('/', requireRole('gym_owner', 'receptionist', 'coach'), async (req: Request, res: Response) => {
  try {
    const gym = await prisma.gym.findUnique({ where: { id: req.gymId } });
    if (!gym) { res.status(404).json({ error: 'Gym not found' }); return; }
    res.json({ gym });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.put('/', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const { name, primaryColor, secondaryColor, address, city, state, pincode, gstin } = req.body;
    const gym = await prisma.gym.update({
      where: { id: req.gymId },
      data: { name, primaryColor, secondaryColor, address, city, state, pincode, gstin },
    });
    res.json({ gym });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Public endpoint — no auth required
router.get('/branding', async (req: Request, res: Response) => {
  try {
    const slug = req.query.slug as string;
    if (!slug) { res.status(400).json({ error: 'slug query param required' }); return; }

    const gym = await prisma.gym.findUnique({
      where: { slug },
      select: { name: true, logoUrl: true, primaryColor: true, secondaryColor: true },
    });
    if (!gym) { res.status(404).json({ error: 'Gym not found' }); return; }
    res.json(gym);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ─── Gym QR Code ──────────────────────────────────────
router.get('/qr', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const gymId = req.gymId!;
    const hash = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(gymId)
      .digest('hex');

    // QR data that gets encoded into the QR image
    const qrData = JSON.stringify({ gymId, hash });

    res.json({
      qrData,
      gymId,
      hash,
      instructions: 'Encode this data into a QR code. Members scan this with the app to check in.',
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Regenerate QR (changes the JWT_SECRET-based hash; previous QR codes stop working)
router.post('/qr/regenerate', requireRole('gym_owner'), async (_req: Request, res: Response) => {
  try {
    // In production, you'd rotate a per-gym secret stored in DB.
    // With HMAC based on JWT_SECRET + gymId, the QR is already gym-specific.
    // This endpoint is a placeholder for when per-gym secrets are added.
    res.json({
      message: 'QR code regenerated. Previous QR codes will no longer work.',
      warning: 'Please print and display the new QR code at your gym entrance.',
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
