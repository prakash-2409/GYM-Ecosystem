import { Request, Response, NextFunction } from 'express';
import prisma from '@gymstack/db';

export async function gymContext(req: Request, res: Response, next: NextFunction): Promise<void> {
  // If user is authenticated and has a gymId, use that
  if (req.user?.gymId) {
    req.gymId = req.user.gymId;
    next();
    return;
  }

  // Try to extract gym from X-Gym-Slug header (for frontend)
  const gymSlug = req.headers['x-gym-slug'] as string | undefined;
  if (gymSlug) {
    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug }, select: { id: true, isActive: true } });
    if (!gym || !gym.isActive) {
      res.status(404).json({ error: 'Gym not found or inactive' });
      return;
    }
    req.gymId = gym.id;
    next();
    return;
  }

  // Super admin doesn't need gym context for certain routes
  if (req.user?.role === 'super_admin') {
    next();
    return;
  }

  res.status(400).json({ error: 'Gym context required' });
}
