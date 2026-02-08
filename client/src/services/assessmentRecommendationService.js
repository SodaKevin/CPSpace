// src/services/assessmentRecommendationService.js

/**
 * Severity-based recommendation service for assessments (PHQ-9 / GAD-7)
 */

const SEVERITY_TAG_MAP = {
  NONE: [
    "SLEEP",
    "GRATITUDE",
    "MOTIVATION",
    "AFFIRMATION",
  ],

  MILD: [
    "RELAXATION",
    "BREATHING",
    "SLEEP",
    "PHYSICAL",
  ],

  MODERATE: [
    "GROUNDING",
    "SELF_REFLECTION",
    "JOURNALING",
  ],

  "MODERATELY SEVERE": [
    "GROUNDING",
    "JOURNALING",
    "THERAPY",
  ],

  SEVERE: [
    "THERAPY",
    "GROUNDING",
  ],
};

export function getAssessmentRecommendations({
  severity,
  strategies,
  limit = 3,
}) {
  if (!severity || !Array.isArray(strategies)) {
    return [];
  }

  console.log("ASSESSMENT SEVERITY:", severity);

  // 1. Severity safety gate
  const eligible = strategies.filter(strategy =>
    isSeverityAppropriate(strategy, severity)
  );

  if (!eligible.length) {
    return [];
  }

  console.log(
    "ELIGIBLE STRATEGIES:",
    eligible.map(s => ({
        id: s.id,
        tags: s.tags,
        minSeverity: s.minSeverity,
    }))
  );

  // 2. Get preferred tags for this severity
  const preferredTags = SEVERITY_TAG_MAP[severity] || [];

  // 3. Score strategies
  const ranked = eligible
    .map(strategy => ({
      ...strategy,
      score: scoreBySeverity(strategy, preferredTags),
    }))
    .sort((a, b) => b.score - a.score);

  console.log(
    "FINAL ASSESSMENT RECOMMENDATIONS:",
    ranked.slice(0, limit).map(s => ({
        id: s.id,
        tags: s.tags,
        score: s.score,
    }))
  );

  // 4. Return top N
  return ranked.slice(0, limit);
}

function isSeverityAppropriate(strategy, severity) {
  if (!strategy.minSeverity) return true;

  const ORDER = [
    "NONE",
    "MILD",
    "MODERATE",
    "MODERATELY SEVERE",
    "SEVERE",
  ];

  return (
    ORDER.indexOf(severity) >=
    ORDER.indexOf(strategy.minSeverity)
  );
}

function scoreBySeverity(strategy, preferredTags) {
  if (!Array.isArray(strategy.tags)) return 1;

  let score = 1;

  strategy.tags.forEach(tag => {
    if (preferredTags.includes(tag)) {
      score += 2;
    }
  });

  return score;
}