const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// POST /api/chat (message + recommended_model_ids)
export async function sendChatMessage(message, recommendedModelIds) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      recommended_model_ids: recommendedModelIds || [],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

