import { useState, useEffect, useCallback, useRef } from 'react'
import axiosClient from '../api/axiosClient'
import aiClient from '../api/aiClient'

/**
 * Fetches the AI-generated clinical summary for a patient.
 * Endpoint: GET /api/v1/patients/{patientId}/summary
 *
 * Automatically polls when the backend returns 202 (documents still processing).
 *
 * @param {string} patientId - UUID of the patient
 * @param {boolean} [autoFetch=true] - Fetch immediately on mount
 */
export function useAiSummary(patientId, autoFetch = true) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const pollTimer = useRef(null)
  const pollCount = useRef(0)
  const MAX_POLLS = 60 // ~5 minutes at 5s intervals

  const clearPoll = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
  }, [])

  const fetch = useCallback(
    async (forceRefresh = false) => {
      if (!patientId) return
      setLoading(true)
      setError(null)
      try {
        const params = forceRefresh ? { refresh: true } : {}
        const response = await aiClient.get(`/patients/${patientId}/summary`, {
          params,
          // Axios treats 2xx as success, so 202 won't throw
          validateStatus: (status) => status >= 200 && status < 300,
        })

        if (response.status === 202) {
          // Documents still processing — poll again
          setProcessing(true)
          pollCount.current += 1
          if (pollCount.current < MAX_POLLS) {
            const delay = (response.data?.retry_after ?? 5) * 1000
            clearPoll()
            pollTimer.current = setTimeout(() => fetch(forceRefresh), delay)
          } else {
            setProcessing(false)
            setError('Document processing is taking longer than expected. Please try again later.')
          }
          setLoading(false)
          return
        }

        // Normal 200 response
        setProcessing(false)
        pollCount.current = 0
        clearPoll()
        setData(response.data)
      } catch (err) {
        setProcessing(false)
        pollCount.current = 0
        clearPoll()
        const detail =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'Failed to load AI summary. Please try again.'
        setError(detail)
      } finally {
        setLoading(false)
      }
    },
    [patientId, clearPoll],
  )

  useEffect(() => {
    if (autoFetch) fetch()
    return clearPoll // cleanup on unmount
  }, [fetch, autoFetch, clearPoll])

  return { data, loading, error, processing, refetch: fetch }
}
