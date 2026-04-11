/**
 * AI Progress Insights Service
 * Generates short tips on every save and full milestone summaries.
 * Covers: personalised encouragement, streak/consistency, emotion trends, common distortions.
 * This is a wellness tool, not therapy.
 */
import { Config } from '../config/env';
import { ThoughtRecord } from '../models/ThoughtRecord';
import { FearProfile } from '../models/FearProfile';

const API_TIMEOUT = 30000;

// Milestone thresholds
export const MILESTONE_COUNTS = [3, 5, 10, 15, 20, 30, 50, 75, 100];

export function isMilestone(recordCount: number): boolean {
  return MILESTONE_COUNTS.includes(recordCount);
}

/**
 * Analyse saved thought records to build a context summary for AI.
 */
function buildInsightContext(
  records: ThoughtRecord[],
  fearProfile?: FearProfile | null,
): string {
  // Emotion frequency map
  const emotionMap: Record<string, number> = {};
  const postEmotionMap: Record<string, number> = {};
  records.forEach(r => {
    r.emotions?.forEach(e => {
      emotionMap[e.name] = (emotionMap[e.name] || 0) + 1;
    });
    r.post_emotions?.forEach(e => {
      postEmotionMap[e.name] = (postEmotionMap[e.name] || 0) + 1;
    });
  });

  // Distortion frequency map
  const distortionMap: Record<string, number> = {};
  records.forEach(r => {
    r.cognitive_distortions?.forEach(d => {
      distortionMap[d] = (distortionMap[d] || 0) + 1;
    });
  });

  // Sort by frequency
  const topEmotions = Object.entries(emotionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => `${name}(${count})`);

  const topPostEmotions = Object.entries(postEmotionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => `${name}(${count})`);

  const topDistortions = Object.entries(distortionMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => `${name}(${count})`);

  // Journaling streak — count consecutive days with records
  const uniqueDays = new Set(records.map(r => r.date?.split('T')[0]));
  const journalDays = uniqueDays.size;

  // Fear profile context
  const fearContext = fearProfile
    ? `Fear profile: feared catastrophes = ${(fearProfile.feared_catastrophes || []).slice(0, 2).join(', ')}; internal signals = ${(fearProfile.internal_signals || []).slice(0, 3).join(', ')}.`
    : '';

  return [
    `Total records: ${records.length}. Journal days: ${journalDays}.`,
    topEmotions.length > 0 ? `Most common pre-emotions: ${topEmotions.join(', ')}.` : '',
    topPostEmotions.length > 0 ? `Most common post-reframe emotions: ${topPostEmotions.join(', ')}.` : '',
    topDistortions.length > 0 ? `Most common distortions: ${topDistortions.join(', ')}.` : '',
    fearContext,
  ]
    .filter(Boolean)
    .join(' ');
}

const insightCache: Record<string, string> = {};

async function fetchWithRetry(url: string, options: any, retries = 3, backoff = 2000): Promise<Response> {
  try {
    const res = await fetch(url, options);
    if (res.status === 429 && retries > 0) {
      await new Promise(resolve => setTimeout(() => resolve(null), backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return res;
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(() => resolve(null), backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

/**
 * Generate a short encouragement tip shown on every save.
 */
export async function getQuickSaveTip(
  savedRecord: ThoughtRecord,
  allRecords: ThoughtRecord[],
  fearProfile?: FearProfile | null,
): Promise<string> {
  const context = buildInsightContext(allRecords, fearProfile);
  const distortionsInRecord = savedRecord.cognitive_distortions?.join(', ') || 'none';
  const emotionsInRecord = savedRecord.emotions?.map(e => e.name).join(', ') || 'unspecified';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Config.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'com.onepctdiscipline.app',
        'X-Title': '1% Discipline',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content: `You are a warm CBT wellness coach inside an agoraphobia recovery app. Write a 1-2 sentence encouragement based on the user's just-saved thought record. Mention something specific from their entry. Never start with "I" or a compliment. Be direct and hopeful. Under 30 words. Do not use any Markdown formatting or asterisks. This is a wellness tool, not therapy.`,
          },
          {
            role: 'user',
            content: `Saved record: emotions = ${emotionsInRecord}; distortions = ${distortionsInRecord}. Context: ${context}. Write a brief tip.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API: ${response.status}`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    return text.replace(/\*/g, '').trim();
  } catch (e: any) {
    console.error('[AIProgressInsights] QuickTip error:', e?.message || e);
    return getLocalQuickTip(allRecords.length);
  }
}

/**
 * Generate a full milestone progress summary.
 */
export async function getMilestoneSummary(
  allRecords: ThoughtRecord[],
  fearProfile?: FearProfile | null,
): Promise<string> {
  const count = allRecords.length;
  const cacheKey = `milestone_${count}_${allRecords[0]?.id}`;
  if (insightCache[cacheKey]) return insightCache[cacheKey];

  const context = buildInsightContext(allRecords, fearProfile);

  try {
    // Add a small delay if called back-to-back with QuickTip
    await new Promise(resolve => setTimeout(() => resolve(null), 500));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetchWithRetry('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Config.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'com.onepctdiscipline.app',
        'X-Title': '1% Discipline',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        max_tokens: 250,
        messages: [
          {
            role: 'system',
            content: `You are a warm CBT wellness coach inside an agoraphobia recovery app providing a milestone progress summary. Cover these 4 areas:
1. Personalised encouragement based on their fear profile
2. Journaling streak/consistency
3. Emotion trends (are anxiety levels shifting?)
4. Most common cognitive distortions to watch for

Write 3-5 sentences. Be warm, specific, and action-oriented. Never start with "I" or a compliment. Do not use any Markdown formatting or asterisks. This is a wellness tool, not therapy.`,
          },
          {
            role: 'user',
            content: `Milestone reached: ${allRecords.length} records! ${context}`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API: ${response.status}`);
    const data = await response.json();
    const result = (data.choices?.[0]?.message?.content || '').replace(/\*/g, '').trim();
    if (result) insightCache[cacheKey] = result;
    return result;
  } catch (e: any) {
    console.error('[AIProgressInsights] Milestone error:', e?.message || e);
    return getLocalMilestoneSummary(allRecords);
  }
}

/**
 * Offline fallback — quick tip
 */
function getLocalQuickTip(recordCount: number): string {
  const tips = [
    'Naming the distortion weakens its grip. Well done journaling.',
    'Each record is a rep for your thinking muscles. Keep going.',
    'Recognising the thought pattern is the hardest step — you just did it.',
    'Writing it down externalises the fear. That takes real courage.',
    'Your brain is learning a new pattern every time you journal.',
  ];
  return tips[recordCount % tips.length];
}

/**
 * Offline fallback — milestone
 */
function getLocalMilestoneSummary(records: ThoughtRecord[]): string {
  const count = records.length;
  const distortionMap: Record<string, number> = {};
  records.forEach(r => r.cognitive_distortions?.forEach(d => {
    distortionMap[d] = (distortionMap[d] || 0) + 1;
  }));
  const topDistortion = Object.entries(distortionMap).sort((a, b) => b[1] - a[1])[0];

  return `Milestone — ${count} records! ${
    topDistortion
      ? `Your most common thinking trap is "${topDistortion[0]}" — awareness is the first defence.`
      : 'Keep journaling to reveal your thinking patterns.'
  } Consistency is your superpower. Every record rewires a neural pathway.`;
}
