import { Router } from 'express';
import authRoutes from './auth.routes';
import gymRoutes from './gym.routes';
import memberRoutes from './member.routes';
import checkinRoutes from './checkin.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';
import staffRoutes from './staff.routes';
import notificationRoutes from './notification.routes';
import workoutRoutes from './workout.routes';
import planRoutes from './plan.routes';
import dietRoutes from './diet.routes';
import bodyStatsRoutes from './bodystats.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/gym', gymRoutes);
router.use('/members', memberRoutes);
router.use('/checkins', checkinRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/staff', staffRoutes);
router.use('/notifications', notificationRoutes);
router.use('/workouts', workoutRoutes);
router.use('/plans', planRoutes);
router.use('/diets', dietRoutes);
router.use('/bodystats', bodyStatsRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
