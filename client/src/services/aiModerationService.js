const MODERATION_ENDPOINT = "http://localhost:5000/predict";
const REQUEST_TIMEOUT_MS = 5000;

export async function moderateText(text) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(MODERATION_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Moderation request failed");
    }

    const data = await response.json();

    return {
      label: String(data?.label ?? "Safe"),
      confidence: Number(data?.confidence ?? 1.0),
    };
  } catch {
    return {
      label: "Safe",
      confidence: 1.0,
      error: true,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
