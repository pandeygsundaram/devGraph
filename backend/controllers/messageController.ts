import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { validateMessageContent, validateMessagesBatch } from '../services/llmValidator';
import { processPendingActivities } from '../services/batchProcessor';

interface IngestMessageBody {
  activityType: string;
  content: string;
  teamId: string;
  metadata?: Record<string, any>;
}

interface IngestBatchBody {
  messages: IngestMessageBody[];
}

/**
 * Fast endpoint to ingest messages without processing
 * Messages are stored with processed=false for later batch processing
 */
export const ingestMessage = async (
  req: Request<{}, {}, IngestMessageBody>,
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

    // Validate content using LLM before storing
    const contentValidation = await validateMessageContent({
      content,
      activityType,
      metadata,
    });

    // Reject invalid content
    if (!contentValidation.isValid) {
      res.status(400).json({
        error: 'Content validation failed',
        reason: contentValidation.reason,
      });
      return;
    }

    // Use sanitized content if available (removes sensitive data)
    const finalContent = contentValidation.sanitizedContent || content;

    // Enrich metadata with validation results
    const enrichedMetadata = {
      ...(metadata || {}),
      contentType: contentValidation.contentType,
      tags: contentValidation.tags,
      validationConfidence: contentValidation.confidence,
    };

    // Store the validated message
    const activity = await prisma.activity.create({
      data: {
        userId,
        teamId,
        activityType,
        content: finalContent,
        metadata: enrichedMetadata,
        processed: false, // Mark as unprocessed for batch job
      },
    });

    // Auto-process in background (don't wait for completion)
    processPendingActivities(100, 10000).catch((error) => {
      console.error('[Auto-Process] Background processing failed:', error);
    });

    res.status(201).json({
      message: 'Message validated and processing started',
      activity: {
        id: activity.id,
        timestamp: activity.timestamp,
        processed: false,
        validation: {
          contentType: contentValidation.contentType,
          confidence: contentValidation.confidence,
        },
      },
    });
  } catch (error) {
    console.error('Ingest message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Batch ingest multiple messages at once
 * Even faster for bulk data ingestion
 */
export const ingestBatch = async (
  req: Request<{}, {}, IngestBatchBody>,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = (req as any).user.id;
    const { messages } = req.body;

    if (!messages || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required and cannot be empty' });
      return;
    }

    // Validate all messages using LLM
    const validationInputs = messages.map((msg: IngestMessageBody) => ({
      content: msg.content,
      activityType: msg.activityType,
      metadata: msg.metadata,
    }));

    const validationResults = await validateMessagesBatch(validationInputs);

    // Filter out invalid messages
    const validMessages: any[] = [];
    const rejectedMessages: any[] = [];

    messages.forEach((msg: IngestMessageBody, index: number) => {
      const validation = validationResults[index];

      if (validation.isValid) {
        validMessages.push({
          userId,
          teamId: msg.teamId,
          activityType: msg.activityType,
          content: validation.sanitizedContent || msg.content,
          metadata: {
            ...(msg.metadata || {}),
            contentType: validation.contentType,
            tags: validation.tags,
            validationConfidence: validation.confidence,
          },
          processed: false,
        });
      } else {
        rejectedMessages.push({
          index,
          content: msg.content.substring(0, 50) + '...',
          reason: validation.reason,
        });
      }
    });

    // If no valid messages, return error
    if (validMessages.length === 0) {
      res.status(400).json({
        error: 'All messages failed validation',
        rejected: rejectedMessages,
      });
      return;
    }

    // Batch insert only valid messages
    const activities = await prisma.activity.createMany({
      data: validMessages,
    });

    // Auto-process in background (don't wait for completion)
    processPendingActivities(100, 10000).catch((error) => {
      console.error('[Auto-Process] Background processing failed:', error);
    });

    res.status(201).json({
      message: `${activities.count} messages validated and processing started`,
      count: activities.count,
      rejected: rejectedMessages.length,
      rejectedMessages: rejectedMessages.length > 0 ? rejectedMessages : undefined,
      processing: true,
    });
  } catch (error) {
    console.error('Ingest batch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get stats on unprocessed messages
 */
export const getProcessingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { teamId } = req.query;

    const whereClause: any = { userId };
    if (teamId) {
      whereClause.teamId = teamId as string;
    }

    const [unprocessedCount, processedCount, totalCount] = await Promise.all([
      prisma.activity.count({
        where: { ...whereClause, processed: false },
      }),
      prisma.activity.count({
        where: { ...whereClause, processed: true },
      }),
      prisma.activity.count({
        where: whereClause,
      }),
    ]);

    // Get oldest unprocessed message
    const oldestUnprocessed = await prisma.activity.findFirst({
      where: { ...whereClause, processed: false },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true },
    });

    res.status(200).json({
      total: totalCount,
      processed: processedCount,
      unprocessed: unprocessedCount,
      processingRate: totalCount > 0 ? (processedCount / totalCount) * 100 : 0,
      oldestUnprocessed: oldestUnprocessed?.timestamp || null,
    });
  } catch (error) {
    console.error('Get processing stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
