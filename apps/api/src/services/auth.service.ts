import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@gymstack/db';
import { env } from '../config/env';
import type { AuthTokenPayload, LoginResponse } from '@gymstack/shared';
import { TRIAL_DAYS } from '@gymstack/shared';

function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function login(phone: string, password: string, gymSlug?: string): Promise<LoginResponse> {
  // Find user by phone, optionally within a specific gym
  const whereClause: Record<string, unknown> = { phone };
  if (gymSlug) {
    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } });
    if (!gym) throw new Error('Gym not found');
    whereClause.gymId = gym.id;
  }

  const users = await prisma.user.findMany({
    where: whereClause as { phone: string; gymId?: string },
    include: { gym: { select: { id: true, name: true, slug: true } } },
  });

  if (users.length === 0) throw new Error('Invalid credentials');

  // If multiple users found (same phone in different gyms), prefer the one matching gymSlug
  const user = users.length === 1 ? users[0] : users.find((u) => u.gym?.slug === gymSlug) || users[0];

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  if (!user.isActive) throw new Error('Account is deactivated');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = generateToken({ userId: user.id, gymId: user.gymId, role: user.role as AuthTokenPayload['role'] });

  return {
    token,
    user: {
      id: user.id,
      gymId: user.gymId,
      role: user.role as AuthTokenPayload['role'],
      phone: user.phone,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
    },
    gym: user.gym ? { id: user.gym.id, name: user.gym.name, slug: user.gym.slug } : null,
  };
}

export async function registerGym(data: {
  gymName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  password: string;
  slug: string;
}) {
  // Check slug availability
  const existing = await prisma.gym.findUnique({ where: { slug: data.slug } });
  if (existing) throw new Error('This gym URL is already taken');

  const passwordHash = await bcrypt.hash(data.password, 12);
  const subdomain = `${data.slug}.${env.PLATFORM_DOMAIN}`;

  // Get the default "Pro" SaaS plan for trial
  const proPlan = await prisma.saasPlan.findFirst({ where: { name: 'Pro' } });

  const result = await prisma.$transaction(async (tx) => {
    // Create gym
    const gym = await tx.gym.create({
      data: {
        name: data.gymName,
        slug: data.slug,
        subdomain,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        ownerEmail: data.ownerEmail,
      },
    });

    // Create owner user
    const user = await tx.user.create({
      data: {
        gymId: gym.id,
        role: 'gym_owner',
        phone: data.ownerPhone,
        email: data.ownerEmail,
        passwordHash,
        name: data.ownerName,
      },
    });

    // Create SaaS subscription (trial)
    if (proPlan) {
      await tx.saasSubscription.create({
        data: {
          gymId: gym.id,
          saasPlanId: proPlan.id,
          status: 'trial',
          trialEndsAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Seed default membership plans
    await tx.membershipPlan.createMany({
      data: [
        { gymId: gym.id, name: 'Monthly', durationDays: 30, price: 1000 },
        { gymId: gym.id, name: 'Quarterly', durationDays: 90, price: 2700 },
        { gymId: gym.id, name: 'Half-Yearly', durationDays: 180, price: 5000 },
        { gymId: gym.id, name: 'Annual', durationDays: 365, price: 9000 },
      ],
    });

    return { gym, user };
  });

  const token = generateToken({
    userId: result.user.id,
    gymId: result.gym.id,
    role: 'gym_owner',
  });

  return {
    token,
    gym: { id: result.gym.id, name: result.gym.name, slug: result.gym.slug, subdomain: result.gym.subdomain },
    user: {
      id: result.user.id,
      gymId: result.user.gymId,
      role: result.user.role as AuthTokenPayload['role'],
      phone: result.user.phone,
      email: result.user.email,
      name: result.user.name,
      avatarUrl: result.user.avatarUrl,
      isActive: result.user.isActive,
      lastLoginAt: null,
      createdAt: result.user.createdAt.toISOString(),
    },
  };
}
