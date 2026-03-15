import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as notificationService from '../services/notification.service';

const router = Router();
router.use(authenticate, gymContext);

router.get('/', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const result = await notificationService.getNotificationHistory(req.gymId!, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/scheduled', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const notifications = await notificationService.getScheduledNotifications(req.gymId!);
    res.json({ notifications });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const result = await notificationService.sendNotification(req.gymId!, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
