import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export function useDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchDoctors = async () => {
      try {
        const response = await axiosClient.get('/doctors')
        if (isMounted) {
          setDoctors(response.data?.data || response.data || [])
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load doctors', err)
          setError(err?.message || 'Failed to load doctors')
          // Fallback to static data if needed, or just empty
          setDoctors([]) 
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDoctors()

    return () => {
      isMounted = false
    }
  }, [])

  return { doctors, loading, error }
}
