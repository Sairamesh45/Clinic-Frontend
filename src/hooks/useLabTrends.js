import { useState, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import aiClient from '../api/aiClient'

/**
 * Fetches lab value trends for a patient + specific test name.
 * Endpoint: GET /api/v1/patients/{patientId}/lab-trends?test_name=...
 */
export function useLabTrends(patientId) {
  const [data, setData] = useState(null)   // LabTrendResponse
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [testName, setTestName] = useState('')

  const fetch = useCallback(
    async (name) => {
      if (!patientId || !name?.trim()) return
      setLoading(true)
      setError(null)
      setData(null)
      setTestName(name.trim())
      try {
        const { data: res } = await aiClient.get(`/patients/${patientId}/lab-trends`, {
          params: { test_name: name.trim() },
        })
        setData(res)
      } catch (err) {
        const detail =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'Failed to load lab trends.'
        setError(detail)
      } finally {
        setLoading(false)
      }
    },
    [patientId],
  )

  return { data, loading, error, testName, fetch }
}
