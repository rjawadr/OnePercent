/**
 * AI Reframing Service for CBT Thought Records
 * Uses OpenRouter API for model-agnostic AI responses.
 * This is a wellness tool, not therapy.
 */
import { Config } from '../config/env';

const API_TIMEOUT = 15000;

export async function getAIReframe(
  automaticThought: string,
  distortions: string[],
  fearProfile?: { feared_catastrophes?: string[]; internal_signals?: string[] }
): Promise<string> {
  const sanitizedThought = automaticThought.trim().substring(0, 500);
  const distortionText = distortions.length > 0 ? distortions.join(', ') : 'none identified';
  const profileContext = fearProfile?.feared_catastrophes?.length
    ? ` The person commonly fears: ${fearProfile.feared_catastrophes[0].substring(0, 200)}.`
    : '';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Config.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'com.onepctdiscipline.app',
        'X-Title': '1% Discipline',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it',
        max_tokens: 200,
        messages: [
          {
            role: 'system',
            content: `You are a CBT coach inside a wellness app for agoraphobia recovery. Your tone is warm, direct, and non-clinical. Write under 80 words. Never start with "I understand" or a compliment. Focus only on the reframe. This is a wellness tool, not therapy.${profileContext}`,
          },
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
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} — ${errorBody}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return text.trim();
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return 'Request timed out. Please check your connection and try again.';
    }
    return 'Unable to generate suggestion. Please check your connection.';
  }
}
