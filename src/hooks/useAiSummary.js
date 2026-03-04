import { useState, useEffect, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import aiClient from '../api/aiClient'

/**
 * Fetches the AI-generated clinical summary for a patient.
 * Endpoint: GET /api/v1/patients/{patientId}/summary
 *
 * @param {string} patientId - UUID of the patient
 * @param {boolean} [autoFetch=true] - Fetch immediately on mount
 */
export function useAiSummary(patientId, autoFetch = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(
    async (forceRefresh = false) => {
      if (!patientId) return
      setLoading(true)
      setError(null)
      try {
        const params = forceRefresh ? { refresh: true } : {}
        // Ai summary is served by the Ai-Summarizer FastAPI service (/api/v1)
        const response = await aiClient.get(`/patients/${patientId}/summary`, { params })
        // FastAPI returns JSON with the response model under top-level fields
        setData(response.data)
      } catch (err) {
        const detail =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'Failed to load AI summary. Please try again.'
        setError(detail)
      } finally {
        setLoading(false)
      }
    },
    [patientId],
  )

  useEffect(() => {
    if (autoFetch) fetch()
  }, [fetch, autoFetch])

  return { data, loading, error, refetch: fetch }
}
