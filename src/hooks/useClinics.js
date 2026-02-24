import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

export function useClinics() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    ;(async () => {
      try {
        const response = await axiosClient.get('/clinics')
        if (isMounted) {
          setClinics(response.data?.data || response.data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message ?? 'Unable to load clinics right now.')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [])

  return { clinics, loading, error }
}