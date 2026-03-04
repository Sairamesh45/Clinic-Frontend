import { useState, useCallback } from 'react'
import axiosClient from '../api/axiosClient'
import aiClient from '../api/aiClient'

const PAGE_SIZE = 20

/**
 * Fetches the paginated clinical event timeline for a patient.
 * Endpoint: GET /api/v1/patients/{patientId}/timeline
 */
export function usePatientTimeline(patientId) {
  const [events, setEvents] = useState([])
  const [meta, setMeta] = useState(null)       // { total, has_more, event_type_counts }
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [offset, setOffset] = useState(0)
  const [fetched, setFetched] = useState(false)

  const fetch = useCallback(
    async (reset = false) => {
      if (!patientId) return
      const nextOffset = reset ? 0 : offset

      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const { data } = await aiClient.get(`/patients/${patientId}/timeline`, {
          params: { limit: PAGE_SIZE, offset: nextOffset },
        })

        setMeta({
          total: data.total,
          has_more: data.has_more,
          event_type_counts: data.event_type_counts ?? [],
        })

        if (reset) {
          setEvents(data.events)
          setOffset(data.events.length)
        } else {
          setEvents((prev) => [...prev, ...data.events])
          setOffset((prev) => prev + data.events.length)
        }

        setFetched(true)
      } catch (err) {
        const detail =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'Failed to load patient timeline.'
        setError(detail)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patientId, offset],
  )

  const initialFetch = useCallback(() => fetch(true), [fetch])
  const loadMore = useCallback(() => fetch(false), [fetch])

  return {
    events,
    meta,
    loading,
    loadingMore,
    error,
    fetched,
    fetch: initialFetch,
    loadMore,
  }
}
