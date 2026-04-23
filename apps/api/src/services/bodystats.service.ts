import prisma from '@gymstack/db';

export async function getStats(memberId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [stats, total] = await Promise.all([
        prisma.bodyStat.findMany({
            where: { memberId },
            orderBy: { recordedAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.bodyStat.count({ where: { memberId } }),
    ]);

    return { stats, total, page, limit };
}

export async function addEntry(memberId: string, data: {
    weightKg?: number;
    heightCm?: number;
    bodyFatPct?: number;
    chestCm?: number;
    waistCm?: number;
    hipsCm?: number;
    bicepCm?: number;
    thighCm?: number;
    notes?: string;
    recordedAt?: string;
    recordedBy?: string;
}) {
    // Validate member exists
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new Error('Member not found');

    const stat = await prisma.bodyStat.create({
        data: {
            memberId,
            weightKg: data.weightKg,
            heightCm: data.heightCm,
            bodyFatPct: data.bodyFatPct,
            chestCm: data.chestCm,
            waistCm: data.waistCm,
            hipsCm: data.hipsCm,
            bicepCm: data.bicepCm,
            thighCm: data.thighCm,
            notes: data.notes,
            recordedAt: data.recordedAt ? new Date(data.recordedAt) : new Date(),
            recordedBy: data.recordedBy,
        },
    });

    return stat;
}

export async function getLatestComparison(memberId: string) {
    const stats = await prisma.bodyStat.findMany({
        where: { memberId },
        orderBy: { recordedAt: 'desc' },
        take: 2,
    });

    if (stats.length === 0) return { latest: null, previous: null, changes: null };

    const latest = stats[0];
    const previous = stats[1] || null;

    const changes = previous
        ? {
            weightKg: latest.weightKg && previous.weightKg
                ? Number(latest.weightKg) - Number(previous.weightKg)
                : null,
            chestCm: latest.chestCm && previous.chestCm
                ? Number(latest.chestCm) - Number(previous.chestCm)
                : null,
            waistCm: latest.waistCm && previous.waistCm
                ? Number(latest.waistCm) - Number(previous.waistCm)
                : null,
            hipsCm: latest.hipsCm && previous.hipsCm
                ? Number(latest.hipsCm) - Number(previous.hipsCm)
                : null,
            bicepCm: latest.bicepCm && previous.bicepCm
                ? Number(latest.bicepCm) - Number(previous.bicepCm)
                : null,
            thighCm: latest.thighCm && previous.thighCm
                ? Number(latest.thighCm) - Number(previous.thighCm)
                : null,
        }
        : null;

    return { latest, previous, changes };
}

export async function getWeightHistory(memberId: string, weeks: number = 12) {
    const since = new Date();
    since.setDate(since.getDate() - weeks * 7);

    const stats = await prisma.bodyStat.findMany({
        where: {
            memberId,
            recordedAt: { gte: since },
            weightKg: { not: null },
        },
        select: { recordedAt: true, weightKg: true },
        orderBy: { recordedAt: 'asc' },
    });

    return stats.map((s) => ({
        date: s.recordedAt.toISOString().split('T')[0],
        weight: Number(s.weightKg),
    }));
}
