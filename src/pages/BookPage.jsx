import { useState, useMemo } from 'react'
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
  ListFilter
} from 'lucide-react'
import Button from '../components/Button'
import ClinicMap from '../components/ClinicMap'
import axiosClient from '../api/axiosClient'
import { useClinics, useNearbyClinics, useSearchClinics } from '../hooks/useClinics'
import { useGeolocation } from '../hooks/useGeolocation'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../hooks/useAuth'
import { useAppContext } from '../hooks/useAppContext'

export default function BookPage() {
  const navigate = useNavigate()
  
  // Location and map states
  const { location: userLocation, loading: locationLoading, error: locationError, getCurrentLocation } = useGeolocation()
  const { clinics: allClinics, loading: loadingAllClinics } = useClinics()
  const { clinics: nearbyClinics, loading: loadingNearby } = useNearbyClinics(userLocation)
  const { clinics: searchResults, loading: searchLoading, searchClinics, clearSearch } = useSearchClinics()
  
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
  
  // Hooks
  const { notify } = useToast()
  const { user, isAuthenticated } = useAuth()
  const { fetchAppointments } = useAppContext()

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
      // If we have user location and nearby clinics, show nearby
      if (userLocation && nearbyClinics.length > 0) {
        return nearbyClinics
      }
      // Otherwise show all clinics as fallback
      return allClinics
    }
    return []
  }, [viewMode, searchResults, nearbyClinics, allClinics, userLocation])

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-heading font-bold text-slate-900">Find & Book Clinics</h1>
        <p className="text-slate-500 mt-2">Discover clinics near you or search by name</p>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search for clinics..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-12 text-sm font-medium text-slate-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={clearSearchAndShowMap}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                viewMode === 'map' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ListFilter className="h-4 w-4" />
              List View
            </button>
          </div>

          {userLocation && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Navigation className="h-3 w-3" />
              Location detected
            </div>
          )}
        </div>

        {locationError && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Location access needed</p>
              <p className="text-yellow-700">{locationError}</p>
              <button 
                onClick={getCurrentLocation}
                className="text-yellow-800 underline hover:no-underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map or Search Results */}
      {viewMode === 'search' && searchQuery ? (
        // Search Results
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Search Results for "{searchQuery}"
            </h2>
            {searchLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((clinic) => (
                <div 
                  key={clinic.id}
                  onClick={() => handleClinicSelect(clinic)}
                  className={`cursor-pointer rounded-xl border p-5 transition-all duration-200 relative overflow-hidden ${
                    selectedClinic?.id === clinic.id 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary' 
                      : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-bold text-lg ${selectedClinic?.id === clinic.id ? 'text-primary-dark' : 'text-slate-800'}`}>
                        {clinic.name}
                      </h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {clinic.address}
                      </p>
                      <div className="flex gap-4 mt-3 text-xs">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3 w-3" />
                          ~{clinic.stats?.estimatedWaitTime || 0} mins wait
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Users className="h-3 w-3" />
                          {clinic.stats?.totalInQueue || 0} in queue
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <Stethoscope className="h-3 w-3" />
                          {clinic.doctors?.length || 0} doctors
                        </span>
                      </div>
                    </div>
                    {selectedClinic?.id === clinic.id && (
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !searchLoading && (
              <div className="text-center py-12 text-slate-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No clinics found matching "{searchQuery}"</p>
              </div>
            )
          )}
        </div>
      ) : (
        // Map View
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              {userLocation ? 'Nearby Clinics' : 'Clinics Map'}
            </h2>
            {isLoadingClinics && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          </div>

          <ClinicMap
            clinics={displayClinics}
            center={userLocation ? [userLocation.lat, userLocation.lng] : [12.9165, 79.1325]}
            zoom={userLocation ? 14 : 13}
            onClinicSelect={handleClinicSelect}
            userLocation={userLocation}
            height="500px"
            className="mb-4"
            loading={isLoadingClinics}
          />

          {displayClinics.length === 0 && !isLoadingClinics && (
            <div className="text-center py-8 text-slate-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clinics found</p>
            </div>
          )}
        </div>
      )}

      {/* Clinic Selection Form - Only show when clinic is selected */}
      {selectedClinic && (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <h3 className="text-2xl font-bold text-slate-800 mb-6">
            Complete Booking at {selectedClinic.name}
          </h3>

          {/* Doctor Selection */}
          {availableDoctors.length > 0 && (
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Select Doctor
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                {availableDoctors.map((doc) => (
                  <div 
                    key={doc.id}
                    onClick={() => setDoctorId(doc.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 flex items-start gap-3 relative overflow-hidden ${
                      doctorId === doc.id 
                        ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary' 
                        : 'border-slate-200 bg-white hover:border-primary/30 hover:shadow-sm'
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${doctorId === doc.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="relative z-10">
                      <p className={`font-bold ${doctorId === doc.id ? 'text-primary-dark' : 'text-slate-700'}`}>{doc.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{doc.specialty}</p>
                    </div>
                    {doctorId === doc.id && <div className="absolute top-2 right-2"><CheckCircle2 className="h-4 w-4 text-primary" /></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Select Date
            </label>
            <div className="relative group">
              <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="date" 
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-12 pr-4 text-sm font-medium text-slate-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 text-sm text-red-600 animate-in slide-in-from-top-2 fade-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-6 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setSelectedClinic(null)} type="button">
              Change Clinic
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedClinic || !doctorId || !date} className="px-8 shadow-lg shadow-primary/20">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete Booking'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
