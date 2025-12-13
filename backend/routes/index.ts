import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

router.use('/auth', authRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DevTrack AI API is running' });
});

export default router;
