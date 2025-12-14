import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { storeActivityVector, searchSimilarActivities, getKnowledgeGraph } from '../services/vectorService';
import { generateConversationalResponse } from '../services/conversationalChat';

interface CreateActivityBody {
  activityType: string;
  content: string;
  teamId: string;
  metadata?: Record<string, any>;
}

interface SearchActivitiesQuery {
  query: string;
  limit?: string;
  teamId?: string;
}

/**
 * Create a new activity and store its embedding in Qdrant
 */
export const createActivity = async (
  req: Request<{}, {}, CreateActivityBody>,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = (req as any).user.id;
    const { activityType, content, teamId, metadata } = req.body;

    // Create activity in database
    const activity = await prisma.activity.create({
      data: {
        userId,
        teamId,
        activityType,
        content,
        metadata: metadata || {},
        processed: false,
      },
    });

    // Store embedding in Qdrant asynchronously
    try {
      const vectorId = await storeActivityVector(
        activity.id,
        content,
        {
          userId,
          teamId,
          activityType,
          ...(metadata || {}),
        }
      );

      // Update activity with vectorId and mark as processed
      await prisma.activity.update({
        where: { id: activity.id },
        data: {
          vectorId,
          processed: true,
        },
      });

      res.status(201).json({
        message: 'Activity created and embedded successfully',
        activity: {
          ...activity,
          vectorId,
          processed: true,
        },
      });
    } catch (vectorError) {
      console.error('Error storing vector:', vectorError);

      // Activity is created but embedding failed
      res.status(201).json({
        message: 'Activity created but embedding failed',
        activity,
        warning: 'Vector embedding could not be generated. Please check your OpenAI API key.',
      });
    }
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all activities for the authenticated user
 */
export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { teamId, limit = '50', offset = '0' } = req.query;

    const whereClause: any = { userId };
    if (teamId) {
      whereClause.teamId = teamId as string;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      activities,
      count: activities.length,
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Search for similar activities using semantic search
 */
export const searchActivities = async (
  req: Request<{}, {}, {}, SearchActivitiesQuery>,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { query, limit = '10', teamId } = req.query;

    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    // Build filter for Qdrant
    const filter: any = {
      must: [
        {
          key: 'userId',
          match: { value: userId },
        },
      ],
    };

    if (teamId) {
      filter.must.push({
        key: 'teamId',
        match: { value: teamId },
      });
    }

    const results = await searchSimilarActivities(
      query,
      parseInt(limit),
      filter
    );

    // Fetch full activity details from database
    const activityIds = results.map(r => r.id);
    const activities = await prisma.activity.findMany({
      where: {
        id: { in: activityIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Merge activities with similarity scores
    const resultsWithActivities = results.map(result => {
      const activity = activities.find(a => a.id === result.id);
      return {
        score: result.score,
        activity,
      };
    });

    res.status(200).json({
      query,
      results: resultsWithActivities,
      count: resultsWithActivities.length,
    });
  } catch (error) {
    console.error('Search activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single activity by ID
 */
export const getActivityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    res.status(200).json({ activity });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get activity heatmap data for a user
 * Returns count of worklogs and activities per date for heatmap visualization
 */
export const getUserActivityHeatmap = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { teamId, startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Get WorkLogs grouped by date
    const workLogs = await prisma.workLog.findMany({
      where: {
        userId,
        ...(teamId && { teamId: teamId as string }),
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      select: {
        date: true,
        activityCount: true,
        totalHours: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get Activity counts grouped by date
    const activities = await prisma.activity.groupBy({
      by: ['userId'],
      where: {
        userId,
        ...(teamId && { teamId: teamId as string }),
        ...(Object.keys(dateFilter).length > 0 && {
          timestamp: dateFilter,
        }),
      },
      _count: {
        id: true,
      },
    });

    // Format heatmap data
    const heatmapData = workLogs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      count: log.activityCount,
      hours: log.totalHours || 0,
    }));

    res.status(200).json({
      userId,
      heatmapData,
      totalDays: heatmapData.length,
      totalActivities: workLogs.reduce((sum, log) => sum + log.activityCount, 0),
      totalHours: workLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0),
    });
  } catch (error) {
    console.error('Get user activity heatmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get activity data for all team members
 * Used for admin to see all team members' activity
 */
export const getTeamMembersActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user has access to this team
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!teamMember && userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied to this team' });
      return;
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate as string);
    }

    // Get all team members
    const members = await prisma.teamMember.findMany({
      where: {
        teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Get WorkLogs for each member
    const membersActivity = await Promise.all(
      members.map(async (member) => {
        const workLogs = await prisma.workLog.findMany({
          where: {
            userId: member.userId,
            teamId,
            ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
          },
          select: {
            date: true,
            activityCount: true,
            totalHours: true,
          },
          orderBy: {
            date: 'asc',
          },
        });

        const heatmapData = workLogs.map(log => ({
          date: log.date.toISOString().split('T')[0],
          count: log.activityCount,
          hours: log.totalHours || 0,
        }));

        return {
          user: member.user,
          role: member.role,
          heatmapData,
          totalActivities: workLogs.reduce((sum, log) => sum + log.activityCount, 0),
          totalHours: workLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0),
        };
      })
    );

    res.status(200).json({
      teamId,
      members: membersActivity,
      totalMembers: membersActivity.length,
    });
  } catch (error) {
    console.error('Get team members activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Admin endpoint to query member work using embeddings
 * Example: "What work did John do in the last 3 days?"
 */
export const queryMemberWork = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;
    const requesterId = (req as any).user.id;
    const { query, teamId, userId, limit = 20 } = req.body;

    if (!query || !teamId) {
      res.status(400).json({ error: 'Query and teamId are required' });
      return;
    }

    // Check if user is admin or team admin/owner
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        userId: requesterId,
        teamId,
      },
    });

    const isTeamAdmin = teamMember && (teamMember.role === 'ADMIN' || teamMember.role === 'OWNER');
    const isSystemAdmin = userRole === 'ADMIN';

    if (!isSystemAdmin && !isTeamAdmin) {
      res.status(403).json({ error: 'Admin access required to query member work' });
      return;
    }

    // Build filter for Qdrant search
    const filter: any = {
      must: [
        {
          key: 'teamId',
          match: { value: teamId },
        },
      ],
    };

    // If specific user is specified, filter by userId
    if (userId) {
      filter.must.push({
        key: 'userId',
        match: { value: userId },
      });
    }

    // Search using embeddings
    const results = await searchSimilarActivities(
      query,
      parseInt(limit as any),
      filter
    );

    // Fetch full activity details and WorkLog summaries
    const activityIds = results.map(r => r.id);
    const activities = await prisma.activity.findMany({
      where: {
        id: { in: activityIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Also get recent WorkLogs for context
    const workLogs = await prisma.workLog.findMany({
      where: {
        teamId,
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    });

    // Merge activities with similarity scores
    const resultsWithActivities = results.map(result => {
      const activity = activities.find(a => a.id === result.id);
      return {
        score: result.score,
        activity,
      };
    });

    res.status(200).json({
      query,
      results: resultsWithActivities,
      recentWorkLogs: workLogs,
      count: resultsWithActivities.length,
    });
  } catch (error) {
    console.error('Query member work error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get knowledge graph of topics and their connections
 * Returns most common words/topics from user's activities
 */
export const getActivityKnowledgeGraph = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { teamId, limit = 50 } = req.query;

    const graphData = await getKnowledgeGraph(
      userId,
      teamId as string | undefined,
      parseInt(limit as string)
    );

    res.status(200).json({
      graph: graphData,
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
    });
  } catch (error) {
    console.error('Get knowledge graph error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Conversational chat about user's work using LLM
 * Performs semantic search and generates natural language responses
 */
export const chatWithActivities = async (
  req: Request<{}, {}, {}, SearchActivitiesQuery>,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const userName = (req as any).user.name;
    const { query, limit = '10', teamId } = req.query;

    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    // Build filter for Qdrant
    const filter: any = {
      must: [
        {
          key: 'userId',
          match: { value: userId },
        },
      ],
    };

    if (teamId) {
      filter.must.push({
        key: 'teamId',
        match: { value: teamId },
      });
    }

    // Search for relevant activities
    const searchResults = await searchSimilarActivities(
      query,
      parseInt(limit),
      filter
    );

    // Fetch full activity details from database
    const activityIds = searchResults.map(r => r.id);
    const activities = await prisma.activity.findMany({
      where: {
        id: { in: activityIds },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Generate conversational response using LLM
    const chatResponse = await generateConversationalResponse(
      query,
      activities,
      userName
    );

    res.status(200).json({
      query,
      response: chatResponse.response,
      hasResults: chatResponse.hasResults,
      relevantActivities: chatResponse.relevantActivities,
      activities: activities.slice(0, 5), // Include top 5 activities for reference
    });
  } catch (error) {
    console.error('Chat with activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
