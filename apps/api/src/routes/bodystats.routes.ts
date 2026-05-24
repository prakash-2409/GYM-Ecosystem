import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import * as bodyStatsService from '../services/bodystats.service';
import { asString, requireString } from '../utils/request';

const router = Router();
router.use(authenticate, gymContext);

// Get all body stats for a member
router.get('/:memberId', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const memberId = requireString(req.params.memberId, 'memberId');
        const result = await bodyStatsService.getStats(memberId, {
            page: Number(asString(req.query.page)) || 1,
            limit: Number(asString(req.query.limit)) || 20,
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Get latest comparison (latest vs previous)
router.get('/:memberId/comparison', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const memberId = requireString(req.params.memberId, 'memberId');
        const result = await bodyStatsService.getLatestComparison(memberId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Get weight history for charting
router.get('/:memberId/weight-history', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const memberId = requireString(req.params.memberId, 'memberId');
        const weeks = Number(asString(req.query.weeks)) || 12;
        const result = await bodyStatsService.getWeightHistory(memberId, weeks);
        res.json({ history: result });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// Add new body stat entry
router.post('/:memberId', requireRole('gym_owner', 'receptionist', 'coach', 'member'), async (req: Request, res: Response) => {
    try {
        const memberId = requireString(req.params.memberId, 'memberId');
        const stat = await bodyStatsService.addEntry(memberId, {
            ...req.body,
            recordedBy: req.user?.userId,
        });
        res.status(201).json({ stat });
    } catch (err) {
        res.status(400).json({ error: (err as Error).message });
    }
});

export default router;
