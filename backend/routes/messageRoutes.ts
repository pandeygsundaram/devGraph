import { Router } from 'express';
import { body } from 'express-validator';
import {
  ingestMessage,
  ingestBatch,
  getProcessingStats,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';
import { messageRateLimiter, batchRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Ingest a single message (fast, no processing)
router.post(
  '/',
  messageRateLimiter,
  [
    body('activityType').notEmpty().withMessage('Activity type is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('teamId').notEmpty().withMessage('Team ID is required'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  ],
  ingestMessage
);

// Ingest multiple messages at once
router.post(
  '/batch',
  batchRateLimiter,
  [
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.activityType').notEmpty().withMessage('Activity type is required'),
    body('messages.*.content').notEmpty().withMessage('Content is required'),
    body('messages.*.teamId').notEmpty().withMessage('Team ID is required'),
  ],
  ingestBatch
);

// Get processing statistics
router.get('/stats', getProcessingStats);

export default router;
