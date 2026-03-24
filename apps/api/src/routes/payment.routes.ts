import { Router, Request, Response } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { gymContext } from '../middleware/gym-context';
import { validate } from '../middleware/validate';
import {
  collectFeeSchema,
  createPlanSchema,
  createRazorpayOrderSchema,
  createSubscriptionSchema,
  verifyRazorpayPaymentSchema,
} from '@gymstack/shared';
import * as paymentService from '../services/payment.service';
import * as razorpayService from '../services/razorpay.service';
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

router.post('/razorpay/order', requireRole('member', 'gym_owner', 'receptionist'), validate(createRazorpayOrderSchema), async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'member' && !req.body.memberId) {
      res.status(400).json({ error: 'memberId is required for staff-initiated online payment order' });
      return;
    }

    const member = req.user?.role === 'member'
      ? await prisma.member.findFirst({
          where: { gymId: req.gymId!, userId: req.user.userId },
          include: {
            user: { select: { name: true, phone: true } },
            subscriptions: {
              include: { plan: true },
              orderBy: { endDate: 'desc' },
              take: 1,
            },
            gym: { select: { name: true } },
          },
        })
      : await prisma.member.findFirst({
          where: { id: req.body.memberId, gymId: req.gymId! },
          include: {
            user: { select: { name: true, phone: true } },
            subscriptions: {
              include: { plan: true },
              orderBy: { endDate: 'desc' },
              take: 1,
            },
            gym: { select: { name: true } },
          },
        });

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    const activeSub = member.subscriptions[0];
    if (!activeSub) {
      res.status(400).json({ error: 'No active subscription found for this member' });
      return;
    }

    const daysRemaining = Math.ceil(
      (new Date(activeSub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysRemaining > 7) {
      res.status(400).json({ error: 'Online payment is available only when fee is due' });
      return;
    }

    const amount = Number(activeSub.plan.price);
    const receipt = `MEM-${member.memberCode}-${Date.now()}`.slice(0, 40);

    const order = await razorpayService.createOrder({
      amountPaise: Math.round(amount * 100),
      receipt,
      notes: {
        gymId: req.gymId!,
        memberId: member.id,
        memberCode: member.memberCode,
        planName: activeSub.plan.name,
      },
    });

    res.status(201).json({
      keyId: razorpayService.getRazorpayKeyId(),
      orderId: order.id,
      amount,
      currency: order.currency,
      memberId: member.id,
      memberName: member.user.name,
      memberPhone: member.user.phone,
      gymName: member.gym.name,
      description: `${activeSub.plan.name} membership renewal`,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/razorpay/verify', requireRole('member', 'gym_owner', 'receptionist'), validate(verifyRazorpayPaymentSchema), async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = razorpayService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      res.status(400).json({ error: 'Payment signature verification failed' });
      return;
    }

    const member = req.user?.role === 'member'
      ? await prisma.member.findFirst({
          where: { gymId: req.gymId!, userId: req.user.userId },
        })
      : null;

    if (req.user?.role === 'member' && !member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    const order = await razorpayService.fetchOrder(razorpayOrderId);
    if (order.notes?.gymId && order.notes.gymId !== req.gymId) {
      res.status(403).json({ error: 'This payment order does not belong to the authenticated gym' });
      return;
    }
    const orderMemberId = (order.notes?.memberId as string | undefined) || member?.id;

    if (!orderMemberId) {
      res.status(400).json({ error: 'Unable to resolve member for this payment order' });
      return;
    }

    if (member?.id && orderMemberId !== member.id) {
      res.status(403).json({ error: 'This payment order does not belong to the authenticated member' });
      return;
    }

    const amount = Number(order.amount) / 100;

    const result = await paymentService.createRazorpayPayment(req.gymId!, {
      memberId: orderMemberId,
      amount,
      razorpayOrderId,
      razorpayPaymentId,
      notes: `Paid via Razorpay order ${razorpayOrderId}`,
    });

    res.status(result.alreadyExists ? 200 : 201).json({
      payment: result.payment,
      invoiceNumber: result.invoiceNumber,
      alreadyExists: result.alreadyExists,
    });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
