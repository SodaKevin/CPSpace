// src/pages/diaries/utils/trendBuilder.js

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Build 7-day trend window anchored to selected date.
 * 
 * @param {Object} dailyScores - { "YYYY-MM-DD": score }
 * @param {Date} activeDate
 * @returns {Array} ordered array of 7 days
 */
export function build7DayTrend(dailyScores, activeDate) {
  const trend = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(activeDate);
    date.setDate(activeDate.getDate() - i);

    const key = formatDateKey(date);

    trend.push({
      date: key,
      score: dailyScores[key] ?? null,
    });
  }

  return trend;
}
