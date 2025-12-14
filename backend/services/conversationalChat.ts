import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Activity {
  id: string;
  activityType: string;
  content: string;
  timestamp: Date;
  metadata?: any;
  user?: {
    name: string;
    email: string;
  };
}

interface ChatResponse {
  response: string;
  relevantActivities: number;
  hasResults: boolean;
}

/**
 * Generate a conversational response about user's work activities
 * Uses LLM to create natural, context-aware responses
 */
export async function generateConversationalResponse(
  query: string,
  relevantActivities: Activity[],
  userName?: string
): Promise<ChatResponse> {
  // If no activities found, return a helpful message
  if (!relevantActivities || relevantActivities.length === 0) {
    return {
      response: "I couldn't find any activities related to your query. I see no task here so far!! 🤔\n\nThis could mean:\n- No work has been logged yet\n- The activities don't match your search\n- Try a different search term",
      relevantActivities: 0,
      hasResults: false,
    };
  }

  // Prepare context from activities
  const activitiesContext = relevantActivities
    .map((activity, index) => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      const time = new Date(activity.timestamp).toLocaleTimeString();
      return `${index + 1}. [${date} at ${time}] ${activity.activityType}: ${activity.content}`;
    })
    .join('\n');

  // Create the prompt for the LLM
  const systemPrompt = `You are a helpful AI assistant analyzing a user's work activities.

Your role is to:
1. Provide clear, conversational responses about the user's work
2. Summarize relevant activities in a natural, human-friendly way
3. ONLY discuss information from the provided activities
4. If the activities don't relate to the query, clearly state you cannot find relevant work
5. Be concise but informative
6. Use a friendly, professional tone

IMPORTANT RULES:
- NEVER make up or invent activities that aren't in the provided data
- ONLY answer based on the activities shown below
- If no relevant activities exist, say "I see no task here so far!!"
- Focus on what the user actually did, when they did it, and why it matters`;

  const userPrompt = `User Query: "${query}"

${userName ? `User's Name: ${userName}\n` : ''}
Relevant Activities Found: ${relevantActivities.length}

Activities:
${activitiesContext}

Based ONLY on the activities above, provide a helpful response to the user's query. Remember:
- Be conversational and natural
- Summarize the key points
- If activities don't match the query well, acknowledge it
- Never invent or assume activities that aren't listed`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content ||
      'I found some activities but had trouble generating a response. Please try again.';

    return {
      response,
      relevantActivities: relevantActivities.length,
      hasResults: true,
    };
  } catch (error) {
    console.error('Error generating conversational response:', error);

    // Fallback to simple summary if LLM fails
    const fallbackResponse = `I found ${relevantActivities.length} activities related to "${query}":\n\n` +
      relevantActivities.slice(0, 3).map((activity, index) => {
        const date = new Date(activity.timestamp).toLocaleDateString();
        return `${index + 1}. ${activity.activityType} on ${date}: ${activity.content.substring(0, 100)}${activity.content.length > 100 ? '...' : ''}`;
      }).join('\n') +
      (relevantActivities.length > 3 ? `\n\n...and ${relevantActivities.length - 3} more activities.` : '');

    return {
      response: fallbackResponse,
      relevantActivities: relevantActivities.length,
      hasResults: true,
    };
  }
}

/**
 * Handle multi-turn conversations with context
 */
export async function generateConversationalResponseWithHistory(
  query: string,
  relevantActivities: Activity[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userName?: string
): Promise<ChatResponse> {
  if (!relevantActivities || relevantActivities.length === 0) {
    return {
      response: "I couldn't find any activities related to your query. I see no task here so far!! 🤔",
      relevantActivities: 0,
      hasResults: false,
    };
  }

  const activitiesContext = relevantActivities
    .map((activity, index) => {
      const date = new Date(activity.timestamp).toLocaleDateString();
      return `${index + 1}. [${date}] ${activity.activityType}: ${activity.content}`;
    })
    .join('\n');

  const systemPrompt = `You are a helpful AI assistant analyzing work activities.

Answer user queries based ONLY on the provided activities. Never make up information.
If no relevant activities exist, clearly state "I see no task here so far!!"
Be conversational, concise, and helpful.`;

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      {
        role: 'user',
        content: `Query: "${query}"\n\nRelevant Activities:\n${activitiesContext}\n\nProvide a helpful response based ONLY on these activities.`,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content ||
      'I had trouble generating a response. Please try again.';

    return {
      response,
      relevantActivities: relevantActivities.length,
      hasResults: true,
    };
  } catch (error) {
    console.error('Error in conversational chat:', error);
    throw error;
  }
}
