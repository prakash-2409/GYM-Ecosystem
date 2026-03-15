import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as bodyStatsService from '../services/bodystats.service';

const router = Router();
router.use(authenticate, gymContext);

// Get all body stats for a member
router.get('/:memberId', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const result = await bodyStatsService.getStats(req.params.memberId, {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Get latest comparison (latest vs previous)
router.get('/:memberId/comparison', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const result = await bodyStatsService.getLatestComparison(req.params.memberId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Get weight history for charting
router.get('/:memberId/weight-history', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const weeks = Number(req.query.weeks) || 12;
        const result = await bodyStatsService.getWeightHistory(req.params.memberId, weeks);
        res.json({ history: result });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Add new body stat entry
router.post('/:memberId', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const stat = await bodyStatsService.addEntry(req.params.memberId, {
            ...req.body,
            recordedBy: req.user?.userId,
        });
        res.status(201).json({ stat });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
