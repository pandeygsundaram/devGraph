import { Router } from 'express';
import { body } from 'express-validator';
import {
  createActivity,
  getActivities,
  searchActivities,
  getActivityById,
  getUserActivityHeatmap,
  getTeamMembersActivity,
  queryMemberWork,
  getActivityKnowledgeGraph,
  chatWithActivities,
} from '../controllers/activityController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All activity routes require authentication
router.use(authenticate);

// Create a new activity with embedding
router.post(
  '/',
  [
    body('activityType').notEmpty().withMessage('Activity type is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('teamId').notEmpty().withMessage('Team ID is required'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  ],
  createActivity
);

// Get all activities for authenticated user
router.get('/', getActivities);

// Search activities using semantic search
router.get('/search', searchActivities);

// Conversational chat with LLM about activities
router.get('/chat', chatWithActivities);

// Get knowledge graph of topics
router.get('/knowledge-graph', getActivityKnowledgeGraph);

// Get activity heatmap data for a specific user
router.get('/heatmap/:userId', getUserActivityHeatmap);

// Get activity data for all team members (admin/team owner/admin only)
router.get('/team/:teamId/members', getTeamMembersActivity);

// Admin endpoint to query member work using embeddings
router.post(
  '/query-member-work',
  [
    body('query').notEmpty().withMessage('Query is required'),
    body('teamId').notEmpty().withMessage('Team ID is required'),
    body('userId').optional().isString(),
    body('limit').optional().isInt(),
  ],
  queryMemberWork
);

// Get a single activity by ID
router.get('/:id', getActivityById);

export default router;
