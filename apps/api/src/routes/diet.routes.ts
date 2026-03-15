import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as dietService from '../services/diet.service';

const router = Router();
router.use(authenticate, gymContext);

router.get('/', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const charts = await dietService.getDietCharts(req.gymId!);
    res.json({ charts });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/assignments', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const assignments = await dietService.getAssignments(req.gymId!);
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const chart = await dietService.getDietChartById(req.params.id, req.gymId!);
    res.json({ chart });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const chart = await dietService.createDietChart(req.gymId!, req.user!.userId, req.body);
    res.status(201).json({ chart });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const chart = await dietService.updateDietChart(req.params.id, req.gymId!, req.body);
    res.json({ chart });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    await dietService.deleteDietChart(req.params.id, req.gymId!);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/:id/duplicate', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const chart = await dietService.duplicateDietChart(req.params.id, req.gymId!, req.user!.userId, req.body.name);
    res.status(201).json({ chart });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/:id/assign', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const assignments = await dietService.assignDietChart(req.params.id, req.body.memberIds, req.user!.userId);
    res.status(201).json({ assignments });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
