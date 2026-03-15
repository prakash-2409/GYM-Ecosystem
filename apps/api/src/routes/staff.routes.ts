import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as staffService from '../services/staff.service';

const router = Router();
router.use(authenticate, gymContext);

router.get('/', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.getStaff(req.gymId!);
    res.json({ staff });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.createStaff(req.gymId!, req.body);
    res.status(201).json({ staff });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.patch('/:id/toggle', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const staff = await staffService.toggleStaffStatus(req.params.id, req.gymId!);
    res.json({ staff });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.patch('/:id/reset-password', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const result = await staffService.resetStaffPassword(req.params.id, req.gymId!, req.body.password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
