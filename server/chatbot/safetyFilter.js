// safetyFilter.js
export function keywordSafetyCheck(text) {
  if (!text) return false;

  const patterns = [
    /kill\s+myself/i,
    /wanna\s+kill\s+myself/i,
    /want\s+to\s+kill\s+myself/i,
    /going\s+to\s+kill\s+myself/i,
    /end\s+my\s+life/i,
    /suicid(e|al)/i,
    /hurt\s+myself/i,
    /self[-\s]?harm/i,
    /don'?t\s+want\s+to\s+live/i,
    /want\s+to\s+die/i
  ];

  return patterns.some((p) => p.test(text));
}

export async function openAISafetyCheck(openai, text) {
  const response = await openai.moderations.create({
    model: "omni-moderation-latest",
    input: text
  });

  const result = response.results[0];

  return result.self_harm?.flagged === true;
}
