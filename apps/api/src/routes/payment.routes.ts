import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import { validate } from '../middleware/validate';
import { collectFeeSchema, createPlanSchema, createSubscriptionSchema } from '@gymstack/shared';
import * as paymentService from '../services/payment.service';
import prisma from '@gymstack/db';

const router = Router();
router.use(authenticate, gymContext);

// Plans
router.get('/plans', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { gymId: req.gymId!, isActive: true },
      orderBy: { durationDays: 'asc' },
    });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/plans', requireRole('gym_owner'), validate(createPlanSchema), async (req: Request, res: Response) => {
  try {
    const plan = await prisma.membershipPlan.create({
      data: { ...req.body, gymId: req.gymId! },
    });
    res.status(201).json({ plan });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Subscriptions
router.post('/subscriptions', requireRole('gym_owner', 'receptionist'), validate(createSubscriptionSchema), async (req: Request, res: Response) => {
  try {
    const result = await paymentService.createSubscription(req.gymId!, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Payments
router.get('/', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const result = await paymentService.getPayments(req.gymId!, {
      memberId: req.query.memberId as string,
      from: req.query.from as string,
      to: req.query.to as string,
      method: req.query.method as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/collect', requireRole('gym_owner', 'receptionist'), validate(collectFeeSchema), async (req: Request, res: Response) => {
  try {
    const result = await paymentService.collectPayment(req.gymId!, req.body);
    res.status(201).json({ payment: result.payment, invoiceNumber: result.invoiceNumber });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/due', requireRole('gym_owner', 'receptionist'), async (req: Request, res: Response) => {
  try {
    const members = await paymentService.getDueMembers(req.gymId!);
    res.json({ members });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
