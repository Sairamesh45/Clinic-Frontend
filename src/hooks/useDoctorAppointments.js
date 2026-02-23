import { useCallback, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export function useDoctorAppointments(doctorId) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    if (!doctorId) {
      setAppointments([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axiosClient.get(`/appointments/doctor/${doctorId}`)
      setAppointments(response.data ?? [])
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load today\'s appointments.')
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    if (!doctorId) {
      setLoading(false)
      return
    }

    void fetchAppointments()
    const interval = setInterval(() => {
      void fetchAppointments()
    }, 15000)

    return () => {
      clearInterval(interval)
    }
  }, [doctorId, fetchAppointments])

  return { appointments, loading, error, refresh: fetchAppointments }
}
