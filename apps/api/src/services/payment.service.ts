import prisma from '@gymstack/db';
import { generateInvoicePdf } from '../utils/gst-invoice';

async function getNextInvoiceNumber(gymId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.payment.count({
    where: { gymId, paidAt: { gte: new Date(`${year}-01-01`) } },
  });

  const gym = await prisma.gym.findUnique({ where: { id: gymId }, select: { slug: true } });
  const prefix = gym?.slug?.toUpperCase().slice(0, 6) || 'GYM';
  return `INV-${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;
}

export async function collectPayment(gymId: string, data: {
  memberId: string;
  subscriptionId?: string;
  amount: number;
  paymentMethod: string;
  upiRef?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentStatus?: string;
  paidAt?: Date;
  notes?: string;
}) {
  const member = await prisma.member.findFirst({
    where: { id: data.memberId, gymId },
    include: { user: { select: { name: true, phone: true } } },
  });
  if (!member) throw new Error('Member not found');

  const gym = await prisma.gym.findUnique({ where: { id: gymId } });
  if (!gym) throw new Error('Gym not found');

  const gstPercent = 18;
  const gstAmount = Math.round((data.amount * gstPercent) / (100 + gstPercent) * 100) / 100;
  const baseAmount = data.amount - gstAmount;
  const invoiceNumber = await getNextInvoiceNumber(gymId);

  const payment = await prisma.payment.create({
    data: {
      memberId: data.memberId,
      gymId,
      subscriptionId: data.subscriptionId,
      amount: baseAmount,
      gstAmount,
      totalAmount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus ?? 'completed',
      razorpayPaymentId: data.razorpayPaymentId,
      razorpayOrderId: data.razorpayOrderId,
      upiRef: data.upiRef,
      invoiceNumber,
      notes: data.notes,
      paidAt: data.paidAt,
    },
  });

  // Generate invoice PDF
  const pdfBuffer = await generateInvoicePdf({
    invoiceNumber,
    gym: { name: gym.name, address: gym.address || '', gstin: gym.gstin || '' },
    member: { name: member.user.name, phone: member.user.phone, memberCode: member.memberCode },
    baseAmount,
    gstAmount,
    totalAmount: data.amount,
    paymentMethod: data.paymentMethod,
    paidAt: payment.paidAt,
  });

  // TODO: Upload PDF to R2 and update payment.invoiceUrl

  return { payment, invoiceNumber, pdfBuffer };
}

export async function createRazorpayPayment(gymId: string, data: {
  memberId: string;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  notes?: string;
}) {
  const existing = await prisma.payment.findFirst({
    where: {
      gymId,
      razorpayPaymentId: data.razorpayPaymentId,
    },
  });
  if (existing) {
    return { payment: existing, invoiceNumber: existing.invoiceNumber, alreadyExists: true };
  }

  const result = await collectPayment(gymId, {
    memberId: data.memberId,
    amount: data.amount,
    paymentMethod: 'razorpay',
    paymentStatus: 'completed',
    razorpayPaymentId: data.razorpayPaymentId,
    razorpayOrderId: data.razorpayOrderId,
    notes: data.notes,
  });

  return { ...result, alreadyExists: false };
}

export async function createSubscription(gymId: string, data: {
  memberId: string;
  planId: string;
  startDate: string;
  paymentMethod: string;
  upiRef?: string;
}) {
  const plan = await prisma.membershipPlan.findFirst({ where: { id: data.planId, gymId } });
  if (!plan) throw new Error('Plan not found');

  const startDate = new Date(data.startDate);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const totalAmount = Number(plan.price);
  const gstAmount = Math.round((totalAmount * Number(plan.gstPercent)) / (100 + Number(plan.gstPercent)) * 100) / 100;

  // Deactivate any current active subscription
  await prisma.memberSubscription.updateMany({
    where: { memberId: data.memberId, status: 'active' },
    data: { status: 'expired' },
  });

  const subscription = await prisma.memberSubscription.create({
    data: {
      memberId: data.memberId,
      planId: data.planId,
      gymId,
      startDate,
      endDate,
      status: 'active',
      amountPaid: totalAmount,
    },
  });

  // Collect payment
  const paymentResult = await collectPayment(gymId, {
    memberId: data.memberId,
    subscriptionId: subscription.id,
    amount: totalAmount,
    paymentMethod: data.paymentMethod,
    upiRef: data.upiRef,
  });

  return { subscription, payment: paymentResult.payment, invoiceUrl: null };
}

export async function getPayments(gymId: string, options: {
  memberId?: string;
  from?: string;
  to?: string;
  method?: string;
  page?: number;
  limit?: number;
}) {
  const { memberId, from, to, method, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { gymId };
  if (memberId) where.memberId = memberId;
  if (method) where.paymentMethod = method;
  if (from || to) {
    where.paidAt = {};
    if (from) (where.paidAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.paidAt as Record<string, unknown>).lte = new Date(to);
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: where as Parameters<typeof prisma.payment.findMany>[0]['where'],
      include: {
        member: { include: { user: { select: { name: true } } } },
      },
      orderBy: { paidAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.payment.count({ where: where as Parameters<typeof prisma.payment.count>[0]['where'] }),
  ]);

  return { payments, total, page, limit };
}

export async function getDueMembers(gymId: string) {
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const expiringSubs = await prisma.memberSubscription.findMany({
    where: {
      gymId,
      status: 'active',
      endDate: { lte: sevenDaysFromNow },
    },
    include: {
      member: { include: { user: { select: { name: true, phone: true } } } },
      plan: { select: { name: true, price: true } },
    },
  });

  return expiringSubs.map((sub) => ({
    memberId: sub.memberId,
    memberName: sub.member.user.name,
    memberPhone: sub.member.user.phone,
    planName: sub.plan.name,
    expiredOn: sub.endDate.toISOString(),
    amount: Number(sub.plan.price),
  }));
}
