import qdrantClient from '../config/qdrant';
import { generateEmbedding } from './embeddingService';

// Collection names
export const COLLECTIONS = {
  ACTIVITIES: 'activities',
  WORKLOGS: 'worklogs',
};

// Embedding dimension for text-embedding-3-small
const VECTOR_DIMENSION = 1536;

/**
 * Initialize Qdrant collections if they don't exist
 */
export async function initializeCollections(): Promise<void> {
  try {
    // Check and create activities collection
    const collections = await qdrantClient.getCollections();
    const collectionNames = collections.collections.map(c => c.name);

    if (!collectionNames.includes(COLLECTIONS.ACTIVITIES)) {
      await qdrantClient.createCollection(COLLECTIONS.ACTIVITIES, {
        vectors: {
          size: VECTOR_DIMENSION,
          distance: 'Cosine',
        },
      });

      // Create indexes for filtering
      await qdrantClient.createPayloadIndex(COLLECTIONS.ACTIVITIES, {
        field_name: 'userId',
        field_schema: 'keyword',
      });

      await qdrantClient.createPayloadIndex(COLLECTIONS.ACTIVITIES, {
        field_name: 'teamId',
        field_schema: 'keyword',
      });

      console.log(`✓ Created collection: ${COLLECTIONS.ACTIVITIES}`);
    }

    if (!collectionNames.includes(COLLECTIONS.WORKLOGS)) {
      await qdrantClient.createCollection(COLLECTIONS.WORKLOGS, {
        vectors: {
          size: VECTOR_DIMENSION,
          distance: 'Cosine',
        },
      });
      console.log(`✓ Created collection: ${COLLECTIONS.WORKLOGS}`);
    }

    console.log('✓ Qdrant collections initialized');
  } catch (error) {
    console.error('Error initializing Qdrant collections:', error);
    throw error;
  }
}

/**
 * Store activity with embedding in Qdrant
 * @param activityId UUID of the activity
 * @param text Text content to embed and store
 * @param metadata Additional metadata to store with the vector
 * @returns The Qdrant point ID
 */
export async function storeActivityVector(
  activityId: string,
  text: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  try {
    // Generate embedding
    const { embedding } = await generateEmbedding(text);

    // Store in Qdrant
    const pointId = activityId; // Use activity UUID as point ID
    await qdrantClient.upsert(COLLECTIONS.ACTIVITIES, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            activityId,
            text,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      ],
    });

    return pointId;
  } catch (error) {
    console.error('Error storing activity vector:', error);
    throw new Error('Failed to store activity vector');
  }
}

/**
 * Store worklog with embedding in Qdrant
 * @param worklogId UUID of the worklog
 * @param text Text content to embed and store
 * @param metadata Additional metadata to store with the vector
 * @returns The Qdrant point ID
 */
export async function storeWorklogVector(
  worklogId: string,
  text: string,
  metadata: Record<string, any> = {}
): Promise<string> {
  try {
    // Generate embedding
    const { embedding } = await generateEmbedding(text);

    // Store in Qdrant
    const pointId = worklogId; // Use worklog UUID as point ID
    await qdrantClient.upsert(COLLECTIONS.WORKLOGS, {
      wait: true,
      points: [
        {
          id: pointId,
          vector: embedding,
          payload: {
            worklogId,
            text,
            timestamp: new Date().toISOString(),
            ...metadata,
          },
        },
      ],
    });

    return pointId;
  } catch (error) {
    console.error('Error storing worklog vector:', error);
    throw new Error('Failed to store worklog vector');
  }
}

/**
 * Search for similar activities
 * @param query Search query text
 * @param limit Number of results to return
 * @param filter Optional metadata filter
 * @returns Array of similar activities with scores
 */
export async function searchSimilarActivities(
  query: string,
  limit: number = 10,
  filter?: Record<string, any>
): Promise<any[]> {
  try {
    // Generate embedding for query
    const { embedding } = await generateEmbedding(query);

    // Search in Qdrant
    const results = await qdrantClient.search(COLLECTIONS.ACTIVITIES, {
      vector: embedding,
      limit,
      filter: filter,
      with_payload: true,
    });

    return results;
  } catch (error) {
    console.error('Error searching similar activities:', error);
    throw new Error('Failed to search similar activities');
  }
}

/**
 * Search for similar worklogs
 * @param query Search query text
 * @param limit Number of results to return
 * @param filter Optional metadata filter
 * @returns Array of similar worklogs with scores
 */
export async function searchSimilarWorklogs(
  query: string,
  limit: number = 10,
  filter?: Record<string, any>
): Promise<any[]> {
  try {
    // Generate embedding for query
    const { embedding } = await generateEmbedding(query);

    // Search in Qdrant
    const results = await qdrantClient.search(COLLECTIONS.WORKLOGS, {
      vector: embedding,
      limit,
      filter: filter,
      with_payload: true,
    });

    return results;
  } catch (error) {
    console.error('Error searching similar worklogs:', error);
    throw new Error('Failed to search similar worklogs');
  }
}

/**
 * Delete activity vector from Qdrant
 * @param activityId UUID of the activity
 */
export async function deleteActivityVector(activityId: string): Promise<void> {
  try {
    await qdrantClient.delete(COLLECTIONS.ACTIVITIES, {
      wait: true,
      points: [activityId],
    });
  } catch (error) {
    console.error('Error deleting activity vector:', error);
    throw new Error('Failed to delete activity vector');
  }
}

/**
 * Delete worklog vector from Qdrant
 * @param worklogId UUID of the worklog
 */
export async function deleteWorklogVector(worklogId: string): Promise<void> {
  try {
    await qdrantClient.delete(COLLECTIONS.WORKLOGS, {
      wait: true,
      points: [worklogId],
    });
  } catch (error) {
    console.error('Error deleting worklog vector:', error);
    throw new Error('Failed to delete worklog vector');
  }
}

/**
 * Get knowledge graph data - most common topics and their connections
 * @param userId User ID to filter activities
 * @param teamId Team ID to filter activities
 * @param limit Maximum number of topics to return
 * @returns Knowledge graph with nodes and edges
 */
export async function getKnowledgeGraph(
  userId?: string,
  teamId?: string,
  limit: number = 50
): Promise<{ nodes: any[]; edges: any[] }> {
  try {
    // Scroll through all points in the collection with filter
    const filter: any = {};
    const mustConditions: any[] = [];

    if (userId) {
      mustConditions.push({ key: 'userId', match: { value: userId } });
    }
    if (teamId) {
      mustConditions.push({ key: 'teamId', match: { value: teamId } });
    }

    if (mustConditions.length > 0) {
      filter.must = mustConditions;
    }

    const scrollResult = await qdrantClient.scroll(COLLECTIONS.ACTIVITIES, {
      filter: mustConditions.length > 0 ? filter : undefined,
      limit: 100,
      with_payload: true,
      with_vector: false,
    });

    const points = scrollResult.points;

    // Extract words and count frequencies
    const wordFrequency: Map<string, number> = new Map();
    const wordCoOccurrence: Map<string, Map<string, number>> = new Map();

    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
      'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
    ]);

    // Process each activity
    for (const point of points) {
      const text = ((point.payload?.text as string) || '').toLowerCase();

      // Extract words (simple tokenization)
      const words = text
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter((word: string) =>
          word.length > 3 &&
          !stopWords.has(word) &&
          !/^\d+$/.test(word)
        );

      // Count word frequency
      for (const word of words) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }

      // Track co-occurrences (words appearing together)
      for (let i = 0; i < words.length; i++) {
        const word1 = words[i];
        if (!wordCoOccurrence.has(word1)) {
          wordCoOccurrence.set(word1, new Map());
        }

        for (let j = i + 1; j < words.length; j++) {
          const word2 = words[j];
          const coOccurMap = wordCoOccurrence.get(word1)!;
          coOccurMap.set(word2, (coOccurMap.get(word2) || 0) + 1);
        }
      }
    }

    // Get top N words by frequency
    const topWords = Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word, count]) => ({ word, count }));

    const topWordSet = new Set(topWords.map(w => w.word));

    // Build nodes
    const nodes = topWords.map(({ word, count }, index) => ({
      id: word,
      label: word,
      size: Math.max(10, Math.min(50, count * 3)),
      count: count,
    }));

    // Build edges (connections between co-occurring words)
    const edges: any[] = [];
    for (const { word: word1 } of topWords) {
      const coOccurMap = wordCoOccurrence.get(word1);
      if (coOccurMap) {
        for (const [word2, count] of coOccurMap.entries()) {
          if (topWordSet.has(word2) && count > 1) {
            edges.push({
              source: word1,
              target: word2,
              weight: count,
            });
          }
        }
      }
    }

    return { nodes, edges };
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    throw new Error('Failed to generate knowledge graph');
  }
}
