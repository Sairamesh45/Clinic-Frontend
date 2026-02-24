// Centralized application configuration loaded from Vite env variables.
// Use VITE_... env vars to customize values without hardcoding.
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Clinic'
export const COPYRIGHT_OWNER = import.meta.env.VITE_COPYRIGHT_OWNER || 'Your Company'
export const COPYRIGHT_YEAR = import.meta.env.VITE_COPYRIGHT_YEAR || new Date().getFullYear()

// DEMO_ACCOUNTS can be provided as a JSON string in Vite env: VITE_DEMO_ACCOUNTS='[{"role":"Patient","email":"..."}]'
export const DEMO_ACCOUNTS = (() => {
  try {
    return import.meta.env.VITE_DEMO_ACCOUNTS ? JSON.parse(import.meta.env.VITE_DEMO_ACCOUNTS) : []
  } catch (e) {
    return []
  }
})()

export default {
  APP_NAME,
  COPYRIGHT_OWNER,
  COPYRIGHT_YEAR,
  DEMO_ACCOUNTS,
}
