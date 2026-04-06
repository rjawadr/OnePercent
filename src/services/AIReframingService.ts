/**
 * AI Reframing Service for CBT Thought Records
 * Uses the existing app's API pattern for Claude integration.
 * This is a wellness tool, not therapy.
 */

const API_TIMEOUT = 15000;

export async function getAIReframe(
  automaticThought: string,
  distortions: string[],
  fearProfile?: { feared_catastrophes?: string[]; internal_signals?: string[] }
): Promise<string> {
  // Sanitize input to max 500 chars
  const sanitizedThought = automaticThought.trim().substring(0, 500);
  const distortionText = distortions.length > 0 ? distortions.join(', ') : 'none identified';
  const profileContext = fearProfile?.feared_catastrophes?.length
    ? ` The person commonly fears: ${fearProfile.feared_catastrophes[0].substring(0, 200)}.`
    : '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: `You are a CBT coach inside a wellness app for agoraphobia recovery. Your tone is warm, direct, and non-clinical. Write under 80 words. Never start with "I understand" or a compliment. Focus only on the reframe. This is a wellness tool, not therapy.${profileContext}`,
        messages: [
          {
            role: 'user',
            content: `Automatic thought: "${sanitizedThought}". Cognitive distortions: ${distortionText}. Write a balanced, realistic alternative thought using CBT reframing. Be specific to this thought.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.find((b: any) => b.type === 'text')?.text || '';
    return text.trim();
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'Unable to generate suggestion. Please check your connection.';
  }
}
