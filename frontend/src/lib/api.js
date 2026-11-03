// API utility for making requests to the backend
// Uses VITE_API_URL environment variable in production, relative paths in development

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  const response = await fetch(url, { ...defaultOptions, ...options })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// Convenience methods
export const api = {
  // Learners
  getLearners: () => apiFetch('/api/learners'),
  getLearner: (id) => apiFetch(`/api/learners/${id}`),
  updatePreferences: (id, preferences) => apiFetch(`/api/learners/${id}/preferences`, {
    method: 'PUT',
    body: JSON.stringify(preferences)
  }),
  
  // Lessons
  getLesson: (id) => apiFetch(`/api/lesson/${id}`),
  getAdaptedLesson: (lessonId, learnerId) => apiFetch(`/api/lesson/${lessonId}/adapted/${learnerId}`),
  
  // Quiz
  getQuizQuestions: (conceptId) => apiFetch(`/api/quiz/${conceptId}`),
  submitQuiz: (learnerId, answers) => apiFetch('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ learner_id: learnerId, answers })
  }),
  
  // Teacher
  getTeacherDashboard: () => apiFetch('/api/teacher/dashboard'),
  
  // Health
  healthCheck: () => apiFetch('/api/health')
}