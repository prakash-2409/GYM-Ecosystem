import bcrypt from 'bcryptjs';
import prisma from '@gymstack/db';
import type { CreateMemberInput, UpdateMemberInput } from '@gymstack/shared';

async function generateMemberCode(gymId: string): Promise<string> {
  const lastMember = await prisma.member.findFirst({
    where: { gymId },
    orderBy: { createdAt: 'desc' },
    select: { memberCode: true },
  });

  if (!lastMember) return 'GYM-0001';

  const lastNum = parseInt(lastMember.memberCode.split('-')[1], 10);
  return `GYM-${String(lastNum + 1).padStart(4, '0')}`;
}

export async function getMembers(gymId: string, options: {
  search?: string;
  status?: string;
  planId?: string;
  page?: number;
  limit?: number;
}) {
  const { search, status, planId, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { gymId };

  if (search) {
    where.OR = [
      { memberCode: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { phone: { contains: search } } },
    ];
  }

  if (status === 'active') {
    where.subscriptions = { some: { status: 'active', endDate: { gte: new Date() } } };
  } else if (status === 'expired') {
    where.subscriptions = { every: { OR: [{ status: 'expired' }, { endDate: { lt: new Date() } }] } };
  }

  if (planId) {
    where.subscriptions = { some: { planId } };
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where: where as Parameters<typeof prisma.member.findMany>[0]['where'],
      include: {
        user: { select: { name: true, phone: true, email: true, avatarUrl: true } },
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
          orderBy: { endDate: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.member.count({ where: where as Parameters<typeof prisma.member.count>[0]['where'] }),
  ]);

  return { members, total, page, limit };
}

export async function getMemberById(memberId: string, gymId: string) {
  const member = await prisma.member.findFirst({
    where: { id: memberId, gymId },
    include: {
      user: { select: { name: true, phone: true, email: true, avatarUrl: true } },
      subscriptions: {
        include: { plan: true },
        orderBy: { endDate: 'desc' },
      },
      checkIns: {
        orderBy: { checkedInAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!member) throw new Error('Member not found');

  // Calculate fees due = active subscription with no matching payment? Simplified:
  const activeSubscription = member.subscriptions.find((s) => s.status === 'active');

  const totalVisits = await prisma.checkIn.count({ where: { memberId } });

  return {
    member,
    activeSubscription,
    lastCheckIn: member.checkIns[0]?.checkedInAt.toISOString() || null,
    totalVisits,
  };
}

export async function createMember(gymId: string, data: CreateMemberInput) {
  const memberCode = await generateMemberCode(gymId);
  const defaultPassword = await bcrypt.hash(data.phone.slice(-6), 10);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        gymId,
        role: 'member',
        phone: data.phone,
        email: data.email,
        passwordHash: defaultPassword,
        name: data.name,
      },
    });

    const member = await tx.member.create({
      data: {
        userId: user.id,
        gymId,
        memberCode,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        emergencyPhone: data.emergencyPhone,
        bloodGroup: data.bloodGroup,
        notes: data.notes,
      },
    });

    return { user, member };
  });

  return { ...result.member, memberCode, user: { name: result.user.name, phone: result.user.phone } };
}

export async function updateMember(memberId: string, gymId: string, data: UpdateMemberInput) {
  const member = await prisma.member.findFirst({ where: { id: memberId, gymId } });
  if (!member) throw new Error('Member not found');

  const updates: Record<string, unknown> = {};
  if (data.dateOfBirth !== undefined) updates.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  if (data.gender !== undefined) updates.gender = data.gender;
  if (data.emergencyPhone !== undefined) updates.emergencyPhone = data.emergencyPhone;
  if (data.bloodGroup !== undefined) updates.bloodGroup = data.bloodGroup;
  if (data.notes !== undefined) updates.notes = data.notes;

  const [updatedMember] = await prisma.$transaction([
    prisma.member.update({ where: { id: memberId }, data: updates }),
    ...(data.name || data.phone || data.email
      ? [prisma.user.update({
          where: { id: member.userId },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.email && { email: data.email }),
          },
        })]
      : []),
  ]);

  return updatedMember;
}

export async function deleteMember(memberId: string, gymId: string) {
  const member = await prisma.member.findFirst({ where: { id: memberId, gymId } });
  if (!member) throw new Error('Member not found');

  // Deleting the user cascades to member
  await prisma.user.delete({ where: { id: member.userId } });
  return true;
}
