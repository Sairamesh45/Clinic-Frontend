import axios from 'axios'

// Ai-Summarizer API base (FastAPI). Use Vite env override when present.
const AI_API_BASE = import.meta.env.VITE_AI_API_BASE_URL ?? 'http://localhost:8000/api/v1'

const aiClient = axios.create({
  baseURL: AI_API_BASE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Forward auth token if present in the browser
aiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('clinic_token')
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      }
    }
  }
  return config
})

export default aiClient
