import { useCallback, useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'
import { useAuth } from './useAuth'

export function useQueueStatus(doctorId) {
  const { user } = useAuth()
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
      const params = {}
      // Add patientId if available to get patient's position in queue
      if (user?.patientId) {
        params.patientId = user.patientId
      }
      
      const response = await axiosClient.get(`/appointments/queue/${doctorId}`, { params })
      const rawData = response.data?.data || response.data
      
      // If we have patient position, fetch the full appointment details
      let userAppointment = null
      if (rawData.patientPosition && user?.patientId) {
        try {
          const aptResponse = await axiosClient.get('/appointments')
          const appointments = aptResponse.data?.data || []
          const myApt = appointments.find(a => 
            a.doctorId === Number(doctorId) && 
            a.id === rawData.patientPosition.appointmentId
          )
          if (myApt) {
            userAppointment = {
              id: myApt.id,
              tokenNumber: myApt.tokenNumber,
              status: myApt.status,
              position: rawData.patientPosition.arrivedTokensBefore + 1,
              date: myApt.date,
            }
          }
        } catch (err) {
          console.error('Failed to fetch user appointment details', err)
        }
      }
      
      // Transform the data to match component expectations
      const transformedData = {
        currentToken: rawData.currentInConsultation?.tokenNumber || null,
        totalArrived: rawData.arrivedToday || 0,
        arrivedTokens: rawData.arrived?.map(a => ({
          id: a.appointmentId,
          tokenNumber: a.tokenNumber,
          patient: a.patient,
          arrivalTime: a.arrivalTime,
        })) || [],
        userAppointment: userAppointment || (rawData.patientPosition ? {
          id: rawData.patientPosition.appointmentId,
          tokenNumber: rawData.patientPosition.tokenNumber,
          status: 'BOOKED',
          position: rawData.patientPosition.arrivedTokensBefore + 1,
        } : null),
      }
      
      setData(transformedData)
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Unable to load queue status.')
    } finally {
      setLoading(false)
    }
  }, [doctorId, user?.patientId])

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
