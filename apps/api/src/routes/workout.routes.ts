import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as workoutService from '../services/workout.service';
import { asString, requireString } from '../utils/request';

const router = Router();
router.use(authenticate, gymContext);

router.get('/', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const plans = await workoutService.getWorkoutPlans(req.gymId!);
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/exercises', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const exercises = await workoutService.getExercises(asString(req.query.search), asString(req.query.muscleGroup));
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/assignments', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const assignments = await workoutService.getAssignments(req.gymId!);
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.get('/:id', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const planId = requireString(req.params.id, 'id');
    const plan = await workoutService.getWorkoutPlanById(planId, req.gymId!);
    res.json({ plan });
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
});

router.post('/', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const plan = await workoutService.createWorkoutPlan(req.gymId!, req.user!.userId, req.body);
    res.status(201).json({ plan });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.put('/:id', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const planId = requireString(req.params.id, 'id');
    const plan = await workoutService.updateWorkoutPlan(planId, req.gymId!, req.body);
    res.json({ plan });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.delete('/:id', requireRole('gym_owner'), async (req: Request, res: Response) => {
  try {
    const planId = requireString(req.params.id, 'id');
    await workoutService.deleteWorkoutPlan(planId, req.gymId!);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/:id/assign', requireRole('gym_owner', 'coach'), async (req: Request, res: Response) => {
  try {
    const planId = requireString(req.params.id, 'id');
    const assignments = await workoutService.assignWorkoutPlan(
      planId,
      req.body.memberIds,
      req.user!.userId,
    );
    res.status(201).json({ assignments });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
