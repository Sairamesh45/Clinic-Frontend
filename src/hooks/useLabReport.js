import { useState, useEffect, useCallback, useRef } from 'react'
import aiClient from '../api/aiClient'

/** Polling interval (ms) while documents are still being processed. */
const POLL_INTERVAL = 5_000 // 5 seconds
/** Max polling duration (ms) — stop after this even if still processing. */
const POLL_MAX_DURATION = 180_000 // 3 minutes

/**
 * Fetches the full lab report for a patient — all lab results with flags.
 * Endpoint: GET /api/v1/patients/{patientId}/lab-report
 *
 * After an upload (refreshKey bump) the hook automatically polls until
 * `still_processing` turns false or the timeout is reached.
 *
 * @param {string} patientId
 * @param {number} [refreshKey=0] — bump this to trigger a refetch
 */
export function useLabReport(patientId, refreshKey = 0) {
  const [data, setData] = useState(null)   // LabReportResponse
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pollTimer = useRef(null)
  const pollStart = useRef(null)

  // Stop any running poll
  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current)
      pollTimer.current = null
    }
    pollStart.current = null
  }, [])

  const fetchOnce = useCallback(async () => {
    if (!patientId) return null
    const { data: res } = await aiClient.get(`/patients/${patientId}/lab-report`)
    return res
  }, [patientId])

  const fetchReport = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchOnce()
      setData(res)
      return res
    } catch (err) {
      const detail =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to load lab report.'
      setError(detail)
      return null
    } finally {
      setLoading(false)
    }
  }, [patientId, fetchOnce])

  // Kick off polling loop when still_processing or data is empty after upload
  const startPolling = useCallback(() => {
    stopPolling()
    pollStart.current = Date.now()

    const tick = async () => {
      // Guard: stop if we've been polling too long
      if (Date.now() - pollStart.current > POLL_MAX_DURATION) {
        stopPolling()
        return
      }
      try {
        const res = await fetchOnce()
        if (res) {
          setData(res)
          // Keep polling while backend says documents are still processing
          if (res.still_processing) {
            pollTimer.current = setTimeout(tick, POLL_INTERVAL)
          } else {
            stopPolling()
          }
        } else {
          pollTimer.current = setTimeout(tick, POLL_INTERVAL)
        }
      } catch {
        // Silently retry on transient errors
        pollTimer.current = setTimeout(tick, POLL_INTERVAL)
      }
    }

    // First poll after a short delay (let backend start processing)
    pollTimer.current = setTimeout(tick, POLL_INTERVAL)
  }, [fetchOnce, stopPolling])

  // Fetch on mount and whenever patientId or refreshKey changes
  useEffect(() => {
    stopPolling()
    fetchReport().then((res) => {
      // After an upload (refreshKey > 0) auto-poll if still processing
      // or if there are no results yet (pipeline hasn't finished)
      if (
        refreshKey > 0 &&
        (res?.still_processing || (res && res.total === 0))
      ) {
        startPolling()
      }
    })
    return stopPolling
  }, [fetchReport, refreshKey, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => stopPolling, [stopPolling])

  return { data, loading, error, refetch: fetchReport }
}
