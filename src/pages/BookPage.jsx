import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Stethoscope, 
  CalendarDays, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  MapPin, 
  Clock, 
  Users, 
  Search,
  X,
  Navigation,
  ListFilter,
  Sun,
  Moon
} from 'lucide-react'
import Button from '../components/Button'
import ClinicMap from '../components/ClinicMap'
import axiosClient from '../api/axiosClient'
import { useClinics, useNearbyClinics, useSearchClinics, useClinicsInBounds } from '../hooks/useClinics'
import { useGeolocation } from '../hooks/useGeolocation'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useAppContext } from '../hooks/useAppContext'

const WEEK_DAYS = [
  { label: 'Mon', dayOfWeek: 1 }, { label: 'Tue', dayOfWeek: 2 },
  { label: 'Wed', dayOfWeek: 3 }, { label: 'Thu', dayOfWeek: 4 },
  { label: 'Fri', dayOfWeek: 5 }, { label: 'Sat', dayOfWeek: 6 },
  { label: 'Sun', dayOfWeek: 0 },
]

const fmtTime = (value) => {
  if (!value) return ''
  const str = String(value)
  const tIdx = str.indexOf('T')
  return tIdx !== -1 ? str.slice(tIdx + 1, tIdx + 6) : str.slice(0, 5)
}

// Hardcoded clinic cards for sidebar
const HARDCODED_CLINICS = [
  {
    id: 1,
    name: 'City General Hospital',
    distance: 1.2,
    rating: 4.8,
    waitTime: 15,
    address: '123 Main St, Downtown',
    latitude: 12.9165,
    longitude: 79.1325,
    facilityType: 'hospital'
  },
  {
    id: 2,
    name: 'Sunshine Pediatrics',
    distance: 2.5,
    rating: 4.9,
    waitTime: 45,
    address: '456 Oak Ave, Midtown',
    latitude: 12.9250,
    longitude: 79.1400,
    facilityType: 'clinic'
  },
  {
    id: 3,
    name: 'Metro Care Center',
    distance: 3.1,
    rating: 4.5,
    waitTime: 10,
    address: '789 Pine Rd, Uptown',
    latitude: 12.9050,
    longitude: 79.1250,
    facilityType: 'clinic'
  },
  {
    id: 4,
    name: 'Northside Family Clinic',
    distance: 4.8,
    rating: 4.7,
    waitTime: 90,
    address: '321 Elm St, North District',
    latitude: 12.9300,
    longitude: 79.1150,
    facilityType: 'clinic'
  }
]

export default function BookPage() {
  const navigate = useNavigate()
  
  // Location and map states
  const { location: userLocation, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation()
  const { clinics: allClinics, loading: loadingAllClinics } = useClinics()
  const { clinics: nearbyClinics, loading: loadingNearby } = useNearbyClinics(userLocation)
  const { clinics: searchResults, loading: searchLoading, searchClinics, clearSearch } = useSearchClinics()
  const { clinics: viewportClinics, loading: viewportLoading, fetchForBounds } = useClinicsInBounds()
  
  // Track whether the user has interacted with the map (pan/zoom)
  const [userInteractedWithMap, setUserInteractedWithMap] = useState(false)
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('map') // 'map' | 'search' | 'list'
  
  // Booking states
  const [selectedClinic, setSelectedClinic] = useState(null)
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

  // Clinic hours + doctor availability for the booking panel
  const [clinicHours, setClinicHours] = useState([])
  const [doctorAvailability, setDoctorAvailability] = useState([])

  // Hooks
  const { notify } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { fetchAppointments } = useAppContext()

  // Fetch clinic hours whenever a clinic is selected
  useEffect(() => {
    if (!selectedClinic) { setClinicHours([]); return }
    axiosClient.get(`/clinics/${selectedClinic.id}/hours`)
      .then((r) => setClinicHours(r.data?.data || r.data || []))
      .catch(() => setClinicHours([]))
  }, [selectedClinic])

  // Fetch doctor availability whenever a doctor is selected
  useEffect(() => {
    if (!doctorId) { setDoctorAvailability([]); return }
    axiosClient.get(`/doctors/${doctorId}/availability`)
      .then((r) => setDoctorAvailability(r.data?.data || r.data || []))
      .catch(() => setDoctorAvailability([]))
  }, [doctorId])

  // Get doctors from selected clinic
  const availableDoctors = useMemo(() => {
    if (!selectedClinic) return []
    return selectedClinic.doctors || []
  }, [selectedClinic])

  // Set default doctor when clinic is selected
  if (selectedClinic && !doctorId && availableDoctors.length > 0) {
    setDoctorId(availableDoctors[0].id)
  }

  // Determine which clinics to display
  const displayClinics = useMemo(() => {
    if (viewMode === 'search' && searchResults.length > 0) {
      return searchResults
    }
    if (viewMode === 'map') {
      // Once the user pans/zooms and viewport data is available, use it
      if (userInteractedWithMap && viewportClinics.length > 0) {
        return viewportClinics
      }
      // Initial load: nearby first, then all
      if (userLocation && nearbyClinics.length > 0) {
        return nearbyClinics
      }
      // Fallback to hardcoded clinics if no API data available
      return allClinics.length > 0 ? allClinics : HARDCODED_CLINICS
    }
    return []
  }, [viewMode, searchResults, nearbyClinics, allClinics, userLocation, viewportClinics, userInteractedWithMap])

  // Determine loading state
  const isLoadingClinics = useMemo(() => {
    if (viewMode === 'search') {
      return searchLoading
    }
    if (viewMode === 'map') {
      // If we have location, wait for nearby clinics
      if (userLocation) {
        return loadingNearby
      }
      // Otherwise wait for all clinics
      return loadingAllClinics
    }
    return false
  }, [viewMode, searchLoading, loadingNearby, loadingAllClinics, userLocation])

  // Handle map viewport changes → fetch clinics for the visible area
  const handleBoundsChange = (bounds) => {
    setUserInteractedWithMap(true)
    fetchForBounds(bounds)
  }

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query)
    if (query.trim().length > 0) {
      setViewMode('search')
      await searchClinics(query)
    } else {
      setViewMode('map')
      clearSearch()
    }
  }

  // Handle clinic selection
  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic)
    setDoctorId('') // Reset doctor selection
    notify({ type: 'success', message: `Selected ${clinic.name}` })
  }

  // Clear search and go back to map
  const clearSearchAndShowMap = () => {
    setSearchQuery('')
    setViewMode('map')
    clearSearch()
  }

  // require authentication to book
  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold">Please sign in to book an appointment</h2>
        <p className="text-slate-500 mt-2">You need an account to make and track bookings.</p>
        <div className="mt-6">
          <Button onClick={() => navigate('/login')}>Sign in / Register</Button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const payload = {
        doctorId: parseInt(doctorId) || doctorId,
        patientId: user?.patientId || user?.id,
        date: new Date(date).toISOString(),
        status: 'BOOKED'
      }

      const response = await axiosClient.post('/appointments', payload)
      const data = response.data?.data || response.data

      await fetchAppointments()

      setConfirmation(data)
      notify({ type: 'success', message: `Appointment booked (token ${data.tokenNumber})` })
      setTimeout(() => navigate('/queue', { replace: true }), 2000)
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Unable to book appointment right now.'
      setError(msg)
      notify({ type: 'error', message: msg })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center animate-fade-in py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-glow shadow-emerald-500/20">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-heading font-bold text-slate-800">Booking Confirmed!</h2>
        <p className="mt-2 text-slate-500 max-w-md">Your appointment has been successfully scheduled.</p>
        
        <div className="mt-8 w-full max-w-sm rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden relative group">
          <div className="h-2 bg-gradient-to-r from-primary to-accent w-full absolute top-0" />
          <div className="p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Token Number</p>
            <p className="text-5xl font-black text-slate-800 mt-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">{confirmation.tokenNumber}</p>
            
            <div className="mt-8 space-y-3 pt-8 border-t border-slate-50 text-left">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-700">{selectedClinic?.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                   <User className="h-4 w-4 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-700">{availableDoctors.find(d => d.id == doctorId)?.name}</span>
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                   <CalendarDays className="h-4 w-4 text-slate-400" />
                   <span className="text-sm font-semibold text-slate-700">{date}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-400 animate-pulse">Redirecting to queue...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 20px' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
          Clinics Near Your Location
        </h1>
      </div>

      {/* Main Layout: Sidebar + Map */}
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px', height: '700px', marginBottom: '32px' }}>
        
        {/* Sidebar - Clinic List */}
        <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)' }}>
          {/* Search Input */}
          <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '12px', height: '18px', width: '18px', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search city or clinic..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  outline: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6'
                  e.target.style.background = 'white'
                  e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Clinic Cards List */}
          <div style={{ overflowY: 'auto', padding: '16px', height: 'calc(100% - 60px)' }}>
            {HARDCODED_CLINICS.length > 0 ? (
              HARDCODED_CLINICS.map((clinic) => {
                const waitTime = clinic.waitTime || 0
                let waitTimeColor = '#DCFCE7'
                let waitTextColor = '#166534'
                
                if (waitTime > 60) {
                  waitTimeColor = '#FEE2E2'
                  waitTextColor = '#991B1B'
                } else if (waitTime > 30) {
                  waitTimeColor = '#FEF3C7'
                  waitTextColor = '#92400E'
                }

                return (
                  <div
                    key={clinic.id}
                    onClick={() => handleClinicSelect(clinic)}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      border: selectedClinic?.id === clinic.id ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                      marginBottom: '12px',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      background: selectedClinic?.id === clinic.id ? '#EFF6FF' : 'white',
                      boxShadow: selectedClinic?.id === clinic.id ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedClinic?.id !== clinic.id) {
                        e.currentTarget.style.borderColor = '#3B82F6'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.1)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedClinic?.id !== clinic.id) {
                        e.currentTarget.style.borderColor = '#E2E8F0'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '16px', color: selectedClinic?.id === clinic.id ? '#1D4ED8' : '#0F172A', marginBottom: '6px' }}>
                      {clinic.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span>📍 {clinic.distance.toFixed(1)} miles away</span>
                      <span>⭐ {clinic.rating}</span>
                    </div>
                    <div style={{ display: 'inline-block', marginTop: '10px', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: waitTimeColor, color: waitTextColor }}>
                      ~{waitTime} mins wait
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>
                No clinics available
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        <div style={{ position: 'relative', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)', height: '100%' }}>
          <ClinicMap
            clinics={displayClinics}
            center={userLocation ? [userLocation.lat, userLocation.lng] : [12.9165, 79.1325]}
            zoom={userLocation ? 14 : 13}
            onClinicSelect={handleClinicSelect}
            onBoundsChange={handleBoundsChange}
            userLocation={userLocation}
            height="100%"
            className=""
            loading={isLoadingClinics}
            viewportLoading={viewportLoading}
          />

          {/* Selected Clinic Overlay */}
          {selectedClinic && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '16px',
              width: '300px',
              boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)',
              border: '1px solid #E2E8F0',
              zIndex: 10
            }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#0F172A' }}>
                {selectedClinic.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', marginBottom: '16px' }}>
                {selectedClinic.address || 'Address not available'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#3B82F6' }}>Open Now</span>
                <button
                  onClick={() => {
                    // Scroll to booking form if exists
                    const form = document.querySelector('[data-booking-form]')
                    if (form) form.scrollIntoView({ behavior: 'smooth' })
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '12px',
                    background: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          {/* Zoom Buttons */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10 }}>
            <button style={{ width: '40px', height: '40px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B82F6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}>+</button>
            <button style={{ width: '40px', height: '40px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3B82F6'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}>-</button>
          </div>
        </div>
      </div>

      {/* Clinic Selection Form - Only show when clinic is selected */}
      {selectedClinic && (
        <form onSubmit={handleSubmit} data-booking-form style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ content: '', position: 'absolute', top: 0, right: 0, width: '256px', height: '256px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#0F172A', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
            Complete Booking at {selectedClinic.name}
          </h3>

          {/* Clinic Working Hours */}
          {clinicHours.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Clock style={{ height: '16px', width: '16px', color: '#3B82F6' }} />
                Clinic Working Hours
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {WEEK_DAYS.map((day) => {
                  const entry = clinicHours.find((h) => h.dayOfWeek === day.dayOfWeek)
                  const closed = !entry || entry.isClosed
                  return (
                    <div key={day.dayOfWeek} style={{ borderRadius: '12px', border: '1px solid', borderColor: closed ? '#E2E8F0' : '#DBEAFE', padding: '12px', textAlign: 'center', fontSize: '12px', background: closed ? '#F1F5F9' : '#EFF6FF', color: closed ? '#94A3B8' : '#475569' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>{day.label}</p>
                      {closed ? (
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>Closed</span>
                      ) : (
                        <>
                          <p>{fmtTime(entry.openTime)}</p>
                          <p style={{ color: '#94A3B8' }}>–</p>
                          <p>{fmtTime(entry.closeTime)}</p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Doctor Selection */}
          {availableDoctors.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Stethoscope style={{ height: '16px', width: '16px', color: '#3B82F6' }} />
                Select Doctor
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {availableDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setDoctorId(doc.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      border: doctorId === doc.id ? '1px solid #3B82F6' : '1px solid #E2E8F0',
                      padding: '16px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: doctorId === doc.id ? '#EFF6FF' : 'white',
                      boxShadow: doctorId === doc.id ? '0 10px 25px -5px rgba(59, 130, 246, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (doctorId !== doc.id) {
                        e.currentTarget.style.borderColor = '#DBEAFE'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (doctorId !== doc.id) {
                        e.currentTarget.style.borderColor = '#E2E8F0'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ height: '40px', width: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', shrinkFlex: 0, background: doctorId === doc.id ? '#3B82F6' : '#F1F5F9', color: doctorId === doc.id ? 'white' : '#94A3B8', transition: 'all 0.2s' }}>
                      <User style={{ height: '20px', width: '20px' }} />
                    </div>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <p style={{ fontWeight: 'bold', color: doctorId === doc.id ? '#1D4ED8' : '#1E293B' }}>{doc.name}</p>
                      <p style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{doc.specialty}</p>
                    </div>
                    {doctorId === doc.id && <div style={{ position: 'absolute', top: '8px', right: '8px' }}><CheckCircle2 style={{ height: '16px', width: '16px', color: '#3B82F6' }} /></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <CalendarDays style={{ height: '16px', width: '16px', color: '#3B82F6' }} />
              Select Date
            </label>
            <div style={{ position: 'relative' }}>
              <CalendarDays style={{ position: 'absolute', left: '16px', top: '12px', height: '20px', width: '20px', color: '#94A3B8' }} />
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3B82F6'
                  e.currentTarget.style.background = 'white'
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0'
                  e.currentTarget.style.background = '#F8FAFC'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{ borderRadius: '12px', background: '#FEE2E2', padding: '16px', border: '1px solid #FECACA', display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: '#DC2626', marginBottom: '24px' }}>
              <AlertCircle style={{ height: '20px', width: '20px', shrinkFlex: 0, marginTop: '2px' }} />
              <p>{error}</p>
            </div>
          )}

          <div style={{ paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #E2E8F0' }}>
            <Button variant="ghost" onClick={() => setSelectedClinic(null)} type="button">
              Change Clinic
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedClinic || !doctorId || !date} style={{ paddingLeft: '32px', paddingRight: '32px', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)' }}>
              {isSubmitting ? <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} /> : 'Complete Booking'}
              {!isSubmitting && <ArrowRight style={{ height: '16px', width: '16px' }} />}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
