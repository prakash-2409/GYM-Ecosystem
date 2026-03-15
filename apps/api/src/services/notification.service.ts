import prisma from '@gymstack/db';

export async function getNotificationHistory(gymId: string, params: {
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where: { gymId },
      include: {
        member: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notificationLog.count({ where: { gymId } }),
  ]);

  return { notifications, total, page, limit };
}

export async function sendNotification(gymId: string, data: {
  title: string;
  body: string;
  channel: 'push' | 'whatsapp';
  target: 'all' | 'plan' | 'individual';
  targetId?: string;
  scheduledAt?: string;
}) {
  const { title, body, channel, target, targetId, scheduledAt } = data;

  const status = scheduledAt ? 'scheduled' : 'sent';
  const sentAt = scheduledAt ? undefined : new Date();
  const metadata = scheduledAt ? { scheduledAt } : undefined;

  let memberIds: string[] = [];

  if (target === 'all') {
    const members = await prisma.member.findMany({
      where: { gymId },
      select: { id: true },
    });
    memberIds = members.map((m) => m.id);
  } else if (target === 'plan') {
    if (!targetId) throw new Error('targetId is required for plan target');
    const subscriptions = await prisma.memberSubscription.findMany({
      where: { planId: targetId, status: 'active', member: { gymId } },
      select: { memberId: true },
    });
    memberIds = subscriptions.map((s) => s.memberId);
  } else if (target === 'individual') {
    if (!targetId) throw new Error('targetId is required for individual target');
    const member = await prisma.member.findFirst({
      where: { id: targetId, gymId },
    });
    if (!member) throw new Error('Member not found');
    memberIds = [targetId];
  }

  if (memberIds.length === 0) {
    return { sent: 0 };
  }

  await prisma.notificationLog.createMany({
    data: memberIds.map((memberId) => ({
      gymId,
      memberId,
      type: 'manual',
      channel,
      status,
      title,
      body,
      metadata,
      sentAt,
    })),
  });

  return { sent: memberIds.length };
}

export async function getScheduledNotifications(gymId: string) {
  const notifications = await prisma.notificationLog.findMany({
    where: { gymId, status: 'scheduled' },
    include: {
      member: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return notifications;
}
