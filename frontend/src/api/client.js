const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== "undefined" && (window.location.port === "8001" || window.location.port === "")
    ? ""
    : "http://127.0.0.1:8001");

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.detail || `Request failed with status ${response.status}`;
      throw new Error(msg);
    }
    if (response.status === 204) return null;
    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Roles
  getRoles: () => request("/roles"),
  getRole: (roleId) => request(`/roles/${roleId}`),

  // Learners
  getLearners: () => request("/learners"),
  getLearner: (id) => request(`/learners/${id}`),
  createLearner: (payload) => request("/learners", { method: "POST", body: JSON.stringify(payload) }),
  updateLearner: (id, payload) => request(`/learners/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteLearner: (id) => request(`/learners/${id}`, { method: "DELETE" }),

  // Analysis & Roadmap
  getAnalysis: (learnerId) => request(`/learners/${learnerId}/analysis`, { method: "POST" }),
  getRoadmap: (learnerId) => request(`/learners/${learnerId}/roadmap`),
  createRoadmap: (learnerId) => request(`/learners/${learnerId}/roadmap`, { method: "POST" }),
  updateTask: (taskId, payload) => request(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  replanLearner: (learnerId, payload) => request(`/learners/${learnerId}/replan`, { method: "POST", body: JSON.stringify(payload) }),
  getProgress: (learnerId) => request(`/learners/${learnerId}/progress`),

  // Demo runners
  seedDemo: () => request("/demo/seed", { method: "POST" }),
  simulateDemoStep: (learnerKey) => request(`/demo/simulate-step/${learnerKey}`, { method: "POST" })
};

