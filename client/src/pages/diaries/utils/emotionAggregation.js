// src/pages/diaries/utils/emotionAggregation.js

// Map category to signal
const signalMap = {
  pleasant: 1,
  neutral: 0,
  unpleasant: -1,
};

/**
 * Normalize Firestore timestamp to YYYY-MM-DD
 */
export function toDateKey(timestamp) {
  if (!timestamp) return null;

  const date = timestamp.toDate
    ? timestamp.toDate()
    : new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Compute average daily emotion score.
 * 
 * @param {Array} entries - merged emotion logs + reflections
 * @returns {Object} - { "YYYY-MM-DD": score }
 */
export function computeDailyScores(entries) {
  const grouped = {};

  for (const entry of entries) {
    const dateKey = entry.dateKey;
    if (!dateKey) continue;

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }

    const signal = signalMap[entry.category] ?? 0;
    grouped[dateKey].push(signal);
  }

  const result = {};

  for (const date in grouped) {
    const signals = grouped[date];

    if (!signals.length) {
      result[date] = null;
      continue;
    }

    const sum = signals.reduce((a, b) => a + b, 0);
    const avg = sum / signals.length;

    result[date] = Number(avg.toFixed(3));
  }

  return result;
}
