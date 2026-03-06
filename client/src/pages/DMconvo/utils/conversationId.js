export function generateConversationId(uidA, uidB) {
  if (!uidA || !uidB) {
    throw new Error("Both UIDs required");
  }

  return [uidA, uidB].sort().join("_");
}
