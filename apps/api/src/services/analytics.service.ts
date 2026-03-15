import prisma from '@gymstack/db';

export async function getRevenueAnalytics(gymId: string) {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [thisMonth, lastMonth] = await Promise.all([
    prisma.payment.aggregate({
      where: { gymId, paymentStatus: 'completed', paidAt: { gte: startOfThisMonth } },
      _sum: { totalAmount: true },
    }),
    prisma.payment.aggregate({
      where: { gymId, paymentStatus: 'completed', paidAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { totalAmount: true },
    }),
  ]);

  const current = Number(thisMonth._sum.totalAmount || 0);
  const previous = Number(lastMonth._sum.totalAmount || 0);
  const changePercent = previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

  return { currentMonth: current, lastMonth: previous, changePercent };
}

export async function getPeakHours(gymId: string, days: number = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const checkIns = await prisma.checkIn.findMany({
    where: { gymId, checkedInAt: { gte: since } },
    select: { checkedInAt: true },
  });

  // Aggregate by hour
  const hourCounts = new Array(24).fill(0);
  for (const ci of checkIns) {
    const hour = ci.checkedInAt.getHours();
    hourCounts[hour]++;
  }

  return hourCounts.map((count, hour) => ({ hour, count }));
}

export async function getPlanPopularity(gymId: string) {
  const plans = await prisma.membershipPlan.findMany({
    where: { gymId },
    include: {
      subscriptions: {
        where: { status: 'active' },
      },
    },
  });

  return plans.map((p) => ({
    planId: p.id,
    planName: p.name,
    count: p.subscriptions.length,
    revenue: p.subscriptions.reduce((sum, s) => sum + Number(s.amountPaid), 0),
  })).sort((a, b) => b.count - a.count);
}

export async function getChurnRisk(gymId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Members with active subscriptions who haven't visited in 7+ days
  const members = await prisma.member.findMany({
    where: {
      gymId,
      subscriptions: { some: { status: 'active', endDate: { gte: new Date() } } },
    },
    include: {
      user: { select: { name: true, phone: true, avatarUrl: true } },
      checkIns: { orderBy: { checkedInAt: 'desc' }, take: 1 },
      subscriptions: {
        where: { status: 'active' },
        include: { plan: { select: { name: true } } },
        take: 1,
      },
    },
  });

  return members
    .filter((m) => {
      if (m.checkIns.length === 0) return true;
      return m.checkIns[0].checkedInAt < sevenDaysAgo;
    })
    .map((m) => ({
      memberId: m.id,
      name: m.user.name,
      phone: m.user.phone,
      lastVisit: m.checkIns[0]?.checkedInAt.toISOString() || null,
      daysSinceLastVisit: m.checkIns[0]
        ? Math.floor((Date.now() - m.checkIns[0].checkedInAt.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      planName: m.subscriptions[0]?.plan.name || 'None',
    }));
}

export async function getMemberGrowth(gymId: string, months: number = 12) {
  const results = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

    const [newMembers, totalMembers] = await Promise.all([
      prisma.member.count({ where: { gymId, joinedAt: { gte: start, lte: end } } }),
      prisma.member.count({ where: { gymId, joinedAt: { lte: end } } }),
    ]);

    results.push({
      month: start.toISOString().slice(0, 7),
      newMembers,
      totalMembers,
    });
  }

  return results;
}
