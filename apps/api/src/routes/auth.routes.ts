import { Router, Request, Response } from 'express';
import { login, registerGym } from '../services/auth.service';
import { authLimiter } from '../middleware/rate-limit';

const router = Router();

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { phone, password, gymSlug } = req.body;
    const result = await login(phone, password, gymSlug);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
});

router.post('/register-gym', authLimiter, async (req: Request, res: Response) => {
  try {
    const result = await registerGym(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
