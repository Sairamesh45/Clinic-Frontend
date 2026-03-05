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

// Forward auth token if present in the browser.
// For FormData bodies, remove the default application/json Content-Type so
// Axios lets the browser set multipart/form-data with the correct boundary.
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
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

// On 401 (expired / missing token), clear local storage and fire a custom
// event so React Router (not a hard reload) handles the navigation.
aiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('clinic_token')
      localStorage.removeItem('clinic_user')
      localStorage.removeItem('clinic_role')
      // Dispatch a custom event; AuthContext listens and calls logout()
      // which triggers ProtectedRoute → <Navigate to="/login" />
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }
    return Promise.reject(error)
  }
)

export default aiClient
