import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from '../hooks/useAuth'

export const AppContext = createContext(null)

const initialWidgetLoading = {
  appointments: false,
  vitals: false,
  notifications: false,
}

const initialWidgetErrors = {
  appointments: null,
  vitals: null,
  notifications: null,
}

export function AppProvider({ children }) {
  const { role, token, user } = useAuth()
  const [activeSection, setActiveSection] = useState('Dashboard')
  const [viewDate] = useState(() => new Date())
  const [appointments, setAppointments] = useState([])
  const [healthVitals, setHealthVitals] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loadingStates, setLoadingStates] = useState(initialWidgetLoading)
  const [errorStates, setErrorStates] = useState(initialWidgetErrors)
  const [notificationLoadingId, setNotificationLoadingId] = useState(null)
  const [markAllLoading, setMarkAllLoading] = useState(false)

  const safeUserId = user?.id || user?.identifier || user?.patientId
  const patientId = user?.patientId
  const doctorId = user?.doctorId

  const updateLoading = useCallback((key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateError = useCallback((key, value) => {
    setErrorStates((prev) => ({ ...prev, [key]: value }))
  }, [])

  const fetchAppointments = useCallback(async () => {
    if (!token) {
      setAppointments([])
      updateLoading('appointments', false)
      updateError('appointments', null)
      return
    }

    updateLoading('appointments', true)
    updateError('appointments', null)
    try {
      const params = { upcoming: true }
      const response = await axiosClient.get('/appointments', { params })
      const rawAppointments = response.data?.data || response.data || []
      const transformed = rawAppointments.map((apt) => ({
        id: apt.id,
        tokenNumber: apt.tokenNumber,
        date: apt.date,
        time:
          apt.time ||
          new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        doctor: apt.doctor?.name || 'Unknown Doctor',
        speciality: apt.doctor?.specialization || apt.doctor?.speciality || 'General',
        location:
          apt.doctor?.clinic?.name ||
          apt.doctor?.clinic?.address ||
          apt.doctor?.clinicAddress ||
          'Clinic',
        status: apt.status,
        doctorId: apt.doctorId,
        clinicId: apt.doctor?.clinicId,
      }))
      setAppointments(transformed)
    } catch (err) {
      console.error('Failed to load appointments', err)
      setAppointments([])
      updateError(
        'appointments',
        err?.response?.data?.message || err?.message || 'Could not load appointments at this time.',
      )
    } finally {
      updateLoading('appointments', false)
    }
  }, [token, updateError, updateLoading])

  const fetchVitals = useCallback(async () => {
    if (role !== 'patient' || !patientId || !token) {
      setHealthVitals([])
      updateError('vitals', null)
      return
    }

    updateLoading('vitals', true)
    updateError('vitals', null)
    try {
      const response = await axiosClient.get(`/patients/${patientId}/vitals`, { params: { limit: 6 } })
      setHealthVitals(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to load vitals', err)
      setHealthVitals([])
      updateError('vitals', err?.response?.data?.message || err?.message || 'Unable to load vitals.')
    } finally {
      updateLoading('vitals', false)
    }
  }, [patientId, role, token, updateError, updateLoading])

  const fetchNotifications = useCallback(async () => {
    if (!token) {
      setNotifications([])
      updateError('notifications', null)
      return
    }

    updateLoading('notifications', true)
    updateError('notifications', null)
    try {
      const response = await axiosClient.get('/notifications', { params: { unreadOnly: false } })
      setNotifications(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to load notifications', err)
      setNotifications([])
      updateError('notifications', err?.message || 'Could not fetch notifications.')
    } finally {
      updateLoading('notifications', false)
    }
  }, [token, updateError, updateLoading])

  const markNotificationRead = useCallback(
    async (notificationId) => {
      if (!token || !notificationId) return
      setNotificationLoadingId(notificationId)
      try {
        await axiosClient.put(`/notifications/${notificationId}/read`)
        await fetchNotifications()
      } catch (err) {
        console.error('Failed to mark notification read', err)
      } finally {
        setNotificationLoadingId(null)
      }
    },
    [fetchNotifications, token],
  )

  const markAllNotificationsRead = useCallback(async () => {
    if (!token) return
    setMarkAllLoading(true)
    try {
      await axiosClient.put('/notifications/mark-all-read')
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all notifications read', err)
    } finally {
      setMarkAllLoading(false)
    }
  }, [fetchNotifications, token])

  useEffect(() => {
    if (!token) {
      setAppointments([])
      setHealthVitals([])
      setNotifications([])
      setLoadingStates({ ...initialWidgetLoading })
      setErrorStates({ ...initialWidgetErrors })
      return
    }

    fetchAppointments()
    fetchNotifications()
    if (role === 'patient') {
      fetchVitals()
    }
  }, [token, role, fetchAppointments, fetchNotifications, fetchVitals])

  const value = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      viewDate,
      appointments,
      healthVitals,
      notifications,
      loadingStates,
      errorStates,
      fetchAppointments,
      fetchVitals,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      notificationLoadingId,
      markAllLoading,
    }),
    [
      activeSection,
      appointments,
      errorStates,
      fetchAppointments,
      fetchNotifications,
      fetchVitals,
      healthVitals,
      loadingStates,
      markAllLoading,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      viewDate,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
