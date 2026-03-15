import prisma from '@gymstack/db';

export async function getPlans(gymId: string) {
  return prisma.membershipPlan.findMany({
    where: { gymId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPlanById(id: string, gymId: string) {
  const plan = await prisma.membershipPlan.findFirst({
    where: { id, gymId },
  });

  if (!plan) throw new Error('Plan not found');

  return plan;
}

export async function createPlan(
  gymId: string,
  data: {
    name: string;
    durationDays: number;
    price: number;
    gstPercent?: number;
    description?: string;
  },
) {
  return prisma.membershipPlan.create({
    data: {
      gymId,
      name: data.name,
      durationDays: data.durationDays,
      price: data.price,
      ...(data.gstPercent !== undefined && { gstPercent: data.gstPercent }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });
}

export async function updatePlan(
  id: string,
  gymId: string,
  data: {
    name?: string;
    durationDays?: number;
    price?: number;
    gstPercent?: number;
    description?: string;
  },
) {
  const plan = await prisma.membershipPlan.findFirst({ where: { id, gymId } });
  if (!plan) throw new Error('Plan not found');

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.durationDays !== undefined) updates.durationDays = data.durationDays;
  if (data.price !== undefined) updates.price = data.price;
  if (data.gstPercent !== undefined) updates.gstPercent = data.gstPercent;
  if (data.description !== undefined) updates.description = data.description;

  return prisma.membershipPlan.update({
    where: { id },
    data: updates,
  });
}

export async function togglePlanStatus(id: string, gymId: string) {
  const plan = await prisma.membershipPlan.findFirst({ where: { id, gymId } });
  if (!plan) throw new Error('Plan not found');

  return prisma.membershipPlan.update({
    where: { id },
    data: { isActive: !plan.isActive },
  });
}

export async function deletePlan(id: string, gymId: string) {
  const plan = await prisma.membershipPlan.findFirst({
    where: { id, gymId },
    include: { subscriptions: { take: 1 } },
  });

  if (!plan) throw new Error('Plan not found');

  if (plan.subscriptions.length > 0) {
    throw new Error('Cannot delete plan with existing subscriptions');
  }

  await prisma.membershipPlan.delete({ where: { id } });
  return true;
}
