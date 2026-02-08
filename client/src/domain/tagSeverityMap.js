// src/domain/tagSeverityMap.js
export const TAG_MIN_SEVERITY = {
  THERAPY: "MODERATELY SEVERE",
  GROUNDING: "MODERATE",
  SELF_REFLECTION: "MODERATE",
  JOURNALING: "MILD",
  PHYSICAL: "MILD",
  BREATHING: "MILD",
  RELAXATION: "MILD",
  DISTRACTION: "NONE",
  SLEEP: "NONE",
  GRATITUDE: "NONE",
  AFFIRMATION: "NONE",
  MOTIVATION: "NONE",
};

export const ASSESSMENT_TO_DOMAIN_SEVERITY = {
  Minimal: "NONE",
  Mild: "MILD",
  Moderate: "MODERATE",
  "Moderately Severe": "MODERATELY SEVERE",
  Severe: "SEVERE",
};

const SEVERITY_ORDER = [
  "NONE",
  "MILD",
  "MODERATE",
  "MODERATELY SEVERE",
  "SEVERE",
];

export function deriveMinSeverity(tags = []) {
  let highest = "NONE";

  tags.forEach(tag => {
    const tagSeverity = TAG_MIN_SEVERITY[tag];
    if (
      tagSeverity &&
      SEVERITY_ORDER.indexOf(tagSeverity) >
      SEVERITY_ORDER.indexOf(highest)
    ) {
      highest = tagSeverity;
    }
  });

  return highest;
}
