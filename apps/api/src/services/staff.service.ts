import bcrypt from 'bcryptjs';
import prisma from '@gymstack/db';

const STAFF_ROLES = ['receptionist', 'coach'] as const;

export async function getStaff(gymId: string) {
  const staff = await prisma.user.findMany({
    where: { gymId, role: { in: [...STAFF_ROLES] } },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return staff;
}

export async function createStaff(
  gymId: string,
  data: { name: string; email?: string; phone: string; role: string; password: string },
) {
  if (!STAFF_ROLES.includes(data.role as (typeof STAFF_ROLES)[number])) {
    throw new Error('Role must be receptionist or coach');
  }

  // Check for duplicate phone within the same gym
  const existing = await prisma.user.findFirst({
    where: { phone: data.phone, gymId },
  });
  if (existing) throw new Error('A user with this phone number already exists in this gym');

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      gymId,
      role: data.role,
      phone: data.phone,
      email: data.email,
      passwordHash,
      name: data.name,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return user;
}

export async function toggleStaffStatus(id: string, gymId: string) {
  const user = await prisma.user.findFirst({
    where: { id, gymId, role: { in: [...STAFF_ROLES] } },
  });
  if (!user) throw new Error('Staff member not found');

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  return updated;
}

export async function resetStaffPassword(id: string, gymId: string, newPassword: string) {
  const user = await prisma.user.findFirst({
    where: { id, gymId, role: { in: [...STAFF_ROLES] } },
  });
  if (!user) throw new Error('Staff member not found');

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  return { success: true };
}
