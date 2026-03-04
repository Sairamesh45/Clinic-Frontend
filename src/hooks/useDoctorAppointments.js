import { useCallback, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from './useAuth'

export function useDoctorAppointments() {
  const { token } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setAppointments([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Backend resolves the doctor identity from the JWT — no doctorId param needed.
      // upcoming=true scopes to today + future, status filter kept open so BOOKED/ARRIVED/IN_CONSULTATION all show.
      const response = await axiosClient.get('/appointments', { params: { upcoming: true } })
      const raw = response.data?.data || response.data || []
      // Normalise field names to match what DoctorPage expects
      const normalised = raw.map((a) => ({
        ...a,
        patientName: a.patient?.name || a.patientName || 'Unknown',
        patientId: a.patient?.id ?? a.patientId ?? null,
        token: a.tokenNumber ?? a.token,
        scheduledAt: a.date ? new Date(a.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : null,
      }))
      setAppointments(normalised)
    } catch (err) {
      setError(err?.response?.data?.message ?? "Unable to load today's appointments.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchAppointments()
    const interval = setInterval(() => void fetchAppointments(), 15000)
    return () => clearInterval(interval)
  }, [fetchAppointments])

  return { appointments, loading, error, refresh: fetchAppointments }
}
