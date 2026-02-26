import { useEffect, useState } from 'react'
import axiosClient from '../api/axiosClient'

// Generate dummy doctor data for clinics
const generateDummyDoctors = (clinicName = '') => {
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
  
  // Randomly select 2-5 doctors for each clinic
  const numDoctors = Math.floor(Math.random() * 4) + 2
  const shuffled = doctors.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, numDoctors).map((doctor, index) => ({
    ...doctor,
    id: `${clinicName}-${doctor.id}-${index}` // Make IDs unique per clinic
  }))
}

// Enhance clinic data with additional fields
const enhanceClinicData = (clinics) => {
  return clinics.map(clinic => {
    // Add facility type based on name or randomly assign
    const isHospital = clinic.name?.toLowerCase().includes('hospital') || 
                      clinic.name?.toLowerCase().includes('medical center') ||
                      Math.random() < 0.3 // 30% chance to be hospital if not determinable
    
    return {
      ...clinic,
      facilityType: isHospital ? 'hospital' : 'clinic',
      doctors: clinic.doctors || generateDummyDoctors(clinic.name || clinic.id),
      rating: clinic.rating || (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      patientCount: clinic.patientCount || Math.floor(Math.random() * 50 + 10),
      stats: clinic.stats || {
        estimatedWaitTime: Math.floor(Math.random() * 45 + 5),
        totalInQueue: Math.floor(Math.random() * 15 + 2)
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