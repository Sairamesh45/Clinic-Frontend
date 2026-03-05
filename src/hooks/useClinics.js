import { useEffect, useState, useRef, useCallback } from 'react'
import axiosClient from '../api/axiosClient'

// Simple deterministic hash from a string → number (for stable fallback values)
const hashString = (str) => {
  let hash = 0
  const s = String(str || '')
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Generate deterministic doctor data for clinics based on clinic identifier
const generateDummyDoctors = (clinicKey = '') => {
  const doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'General Medicine', availableSlots: 8, patientCount: 12 },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiology', availableSlots: 5, patientCount: 8 },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', availableSlots: 10, patientCount: 15 },
    { id: 4, name: 'Dr. James Wilson', specialty: 'Dermatology', availableSlots: 6, patientCount: 7 },
    { id: 5, name: 'Dr. Lisa Thompson', specialty: 'Orthopedics', availableSlots: 4, patientCount: 9 },
    { id: 6, name: 'Dr. David Kim', specialty: 'Neurology', availableSlots: 3, patientCount: 6 },
    { id: 7, name: 'Dr. Anna Patel', specialty: 'Psychiatry', availableSlots: 7, patientCount: 11 },
    { id: 8, name: 'Dr. Robert Martinez', specialty: 'Emergency Medicine', availableSlots: 12, patientCount: 20 }
  ]

  // Deterministic selection based on clinic key hash
  const h = hashString(clinicKey)
  const numDoctors = (h % 4) + 2 // 2-5 doctors
  // Stable sort using hash + doctor id
  const sorted = [...doctors].sort((a, b) => (hashString(clinicKey + a.id) % 100) - (hashString(clinicKey + b.id) % 100))
  return sorted.slice(0, numDoctors).map((doctor, index) => ({
    ...doctor,
    id: `${clinicKey}-${doctor.id}-${index}`
  }))
}

// Enhance clinic data with additional fields (fully deterministic — no Math.random)
const enhanceClinicData = (clinics) => {
  return clinics.map(clinic => {
    const key = String(clinic.id || clinic.name || '')
    const h = hashString(key)

    // Determine facility type: use API value first, then name heuristic, then deterministic fallback
    const nameLC = (clinic.name || '').toLowerCase()
    const isHospital =
      clinic.facilityType === 'hospital' ||
      nameLC.includes('hospital') ||
      nameLC.includes('medical center') ||
      nameLC.includes('medical college')

    return {
      ...clinic,
      facilityType: clinic.facilityType || (isHospital ? 'hospital' : 'clinic'),
      doctors: clinic.doctors || generateDummyDoctors(key),
      rating: clinic.rating || ((h % 20 + 30) / 10).toFixed(1),           // 3.0 – 4.9
      patientCount: clinic.patientCount || (h % 50) + 10,                  // 10 – 59
      stats: clinic.stats || {
        estimatedWaitTime: (h % 45) + 5,                                   // 5 – 49
        totalInQueue: (h % 15) + 2                                         // 2 – 16
      }
    }
  })
}

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
          const rawClinics = response.data?.data || response.data || []
          const enhancedClinics = enhanceClinicData(rawClinics)
          setClinics(enhancedClinics)
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
          const rawClinics = response.data?.data || response.data || []
          const enhancedClinics = enhanceClinicData(rawClinics)
          setClinics(enhancedClinics)
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
      const rawClinics = response.data?.data || response.data || []
      const enhancedClinics = enhanceClinicData(rawClinics)
      setClinics(enhancedClinics)
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

// Hook to get a single clinic by ID
export function useClinic(clinicId) {
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!clinicId) {
      setClinic(null)
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const response = await axiosClient.get(`/clinics/${clinicId}`)
        if (isMounted) {
          const rawClinic = response.data?.data || response.data
          const enhancedClinic = enhanceClinicData([rawClinic])[0]
          setClinic(enhancedClinic)
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Unable to load clinic details.')
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
  }, [clinicId])

  return { clinic, loading, error }
}

// ---------- Viewport-based fetching ----------
// Fetches clinics visible in the current map viewport.
// Uses the /clinics/nearby endpoint with center + radius derived from bounds.
export function useClinicsInBounds() {
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const abortRef = useRef(null)

  // Compute radius in km from map bounds
  const boundsToRadius = (bounds) => {
    if (!bounds) return 50
    const { north, south, east, west } = bounds
    // Haversine-ish rough estimate (degrees → km)
    const latDiff = Math.abs(north - south)
    const lngDiff = Math.abs(east - west)
    const avgLat = (north + south) / 2
    const latKm = latDiff * 111 // 1° lat ≈ 111 km
    const lngKm = lngDiff * 111 * Math.cos((avgLat * Math.PI) / 180)
    // Use half the diagonal as the radius
    return Math.ceil(Math.sqrt(latKm ** 2 + lngKm ** 2) / 2) || 50
  }

  const fetchForBounds = useCallback((bounds) => {
    if (!bounds?.center) return

    // Debounce: cancel previous pending request
    if (timerRef.current) clearTimeout(timerRef.current)
    if (abortRef.current) abortRef.current.abort()

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      setError(null)

      try {
        const radius = boundsToRadius(bounds)
        const response = await axiosClient.get('/clinics/nearby', {
          params: {
            lat: bounds.center.lat,
            lng: bounds.center.lng,
            radius,
          },
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          const rawClinics = response.data?.data || response.data || []
          const enhancedClinics = enhanceClinicData(rawClinics)
          setClinics(enhancedClinics)
        }
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          setError(err?.response?.data?.message || err?.message || 'Unable to load clinics for this area.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }, 400) // 400ms debounce
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  return { clinics, loading, error, fetchForBounds }
}