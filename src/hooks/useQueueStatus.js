import { useCallback, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export function useQueueStatus(doctorId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchQueue = useCallback(async () => {
    if (!doctorId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axiosClient.get(`/appointments/queue/${doctorId}`)
      setData(response.data)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load queue status.')
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    if (!doctorId) {
      setLoading(false)
      return
    }

    fetchQueue()
    const intervalId = setInterval(fetchQueue, 15_000)
    return () => clearInterval(intervalId)
  }, [doctorId, fetchQueue])

  return { data, loading, error, refresh: fetchQueue }
}
