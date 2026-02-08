// src/services/recommendationService.js
import { STRATEGY_INTENT } from "../domain/strategyMap";

export function buildEmotionProfile(diaries) {
  const profile = {};

  diaries.forEach(d => {
    d.feelings.forEach(f => {
      const key = f.toLowerCase();
      profile[key] = (profile[key] || 0) + 1;
    });
  });

  return profile;
}

function isEmotionallyAppropriate(strategy, emotionProfile) {
  const userEmotions = Object.keys(emotionProfile);

  return strategy.tags?.some(tag => {
    const intent = STRATEGY_INTENT[tag];
    if (!intent) return false;

    return intent.allowedEmotions.some(e =>
      userEmotions.includes(e)
    );
  });
}

function getDominantEmotion(emotionProfile) {
  return Object.entries(emotionProfile)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
}

function selectWithTagDiversity(list, count, excludeIds = []) {
  const selected = [];
  const usedTags = new Set();

  for (const item of list) {
    if (selected.length >= count) break;
    if (excludeIds.includes(item.id)) continue;

    const primaryTag = item.tags?.[0];
    if (!primaryTag || usedTags.has(primaryTag)) continue;

    usedTags.add(primaryTag);
    selected.push(item);
  }

  return selected;
}

export function getContentScore(strategy, emotionProfile) {
  let score = 0;

  if (!Array.isArray(strategy.tags)) return 0;

  const userEmotions = Object.keys(emotionProfile);

  strategy.tags.forEach(tag => {
    const intent = STRATEGY_INTENT[tag];
    if (!intent) return;

    intent.allowedEmotions.forEach(e => {
      if (emotionProfile[e]) {
        score += emotionProfile[e];
      }
    });
  });

  return score;
}

export function getNormalizedContentScore(strategy, emotionProfile) {
  const rawScore = getContentScore(strategy, emotionProfile);
  const tagCount = strategy.tags?.length || 1;

  return rawScore / tagCount;
}

export function getCollaborativeScore(strategy, dominantEmotion, statsMap) {
  if (!statsMap || !dominantEmotion) return 0;

  return statsMap[strategy.id]?.[dominantEmotion] || 0;
}

export function getHybridScore(
  strategy,
  emotionProfile,
  dominantEmotion,
  statsMap
) {
  const contentScore = getContentScore(strategy, emotionProfile);
  const collabScore = getCollaborativeScore(
    strategy,
    dominantEmotion,
    statsMap
  );

  return (0.7 * contentScore) + (0.3 * collabScore);
}

export function getRecommendedStrategies({
  strategies,
  diaries,
  statsMap,
  limit = 4,
}) {
  // 1. Build emotion profile
  const emotionProfile = buildEmotionProfile(diaries);
  if (!Object.keys(emotionProfile).length) return [];

  // 2. Dominant emotion
  const dominantEmotion = getDominantEmotion(emotionProfile);

  // 3. Emotional appropriateness filter
  const eligible = strategies.filter(s =>
    isEmotionallyAppropriate(s, emotionProfile)
  );

  // 4a. Content-based (raw score)
  const contentRankedRaw = [...eligible]
    .map(s => ({
      ...s,
      score: getContentScore(s, emotionProfile),
    }))
    .sort((a, b) => b.score - a.score);

  // 4b. Content-based (normalized score)
  const contentRankedNormalized = [...eligible]
    .map(s => ({
      ...s,
      score: getNormalizedContentScore(s, emotionProfile),
    }))
    .sort((a, b) => b.score - a.score);

  // 5. Collaborative ranking
  const collabRanked = [...eligible]
    .map(s => ({
      ...s,
      score: getCollaborativeScore(s, dominantEmotion, statsMap),
    }))
    .sort((a, b) => b.score - a.score);

  // 6. Select 1 raw-content pick (broad support)
  const rawContentPick = selectWithTagDiversity(
    contentRankedRaw,
    1
  );

  // 7. Select 1 normalized-content pick (focused support)
  const normalizedContentPick = selectWithTagDiversity(
    contentRankedNormalized,
    1,
    rawContentPick.map(s => s.id)
  );

  // 8. Select 2 collaborative picks (exclude content picks)
  const collabPicks = selectWithTagDiversity(
    collabRanked,
    2,
    [
      ...rawContentPick.map(s => s.id),
      ...normalizedContentPick.map(s => s.id),
    ]
  );

  // Debug logs (temporary)
  console.log(
    "CONTENT (RAW):",
    rawContentPick.map(s => s.id)
  );
  console.log(
    "CONTENT (NORMALIZED):",
    normalizedContentPick.map(s => s.id)
  );
  console.log(
    "COLLAB PICKS:",
    collabPicks.map(s => s.id)
  );

  // 9. Final result
  return [
    ...rawContentPick,
    ...normalizedContentPick,
    ...collabPicks,
  ].slice(0, limit);
}