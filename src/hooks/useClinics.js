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

export function useNearbyClinics(userLocation, radius = 50) {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng) {
      setClinics([])
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const response = await axiosClient.get('/clinics/nearby', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: radius,
          },
        })
        if (isMounted) {
          setClinics(response.data?.data || response.data || [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Unable to load nearby clinics.')
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
  }, [userLocation?.lat, userLocation?.lng, radius])

  return { clinics, loading, error }
}

export function useSearchClinics() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchClinics = async (query) => {
    if (!query || query.trim().length === 0) {
      setClinics([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await axiosClient.get('/clinics/search', {
        params: { q: query.trim() },
      })
      setClinics(response.data?.data || response.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Search failed.')
      setClinics([])
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setClinics([])
    setError(null)
  }

  return { 
    clinics, 
    loading, 
    error, 
    searchClinics, 
    clearSearch 
  }
}