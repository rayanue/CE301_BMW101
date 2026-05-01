const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// POST /api/recommend; ?debug_scores=true adds the score breakdown in the JSON
export async function fetchRecommendations(preferences, { debugScores = false } = {}) {
  const qs = debugScores ? "?debug_scores=true" : "";
  const response = await fetch(`${API_BASE_URL}/api/recommend${qs}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
