import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Users, 
  Clock, 
  Phone, 
  Stethoscope, 
  Building2,
  Calendar,
  UserCheck,
  Navigation
} from 'lucide-react'
import { useClinics } from '../hooks/useClinics'
import { useToast } from '../hooks/useToast'

export default function ClinicDetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { clinics, loading: clinicsLoading } = useClinics()
  
  const [clinic, setClinic] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)

  useEffect(() => {
    // Try to get clinic from location state first (passed from map click)
    if (location.state?.clinic) {
      setClinic(location.state.clinic)
      setLoading(false)
    } 
    // Otherwise, find it in the clinics data
    else if (clinics.length > 0) {
      const foundClinic = clinics.find(c => c.id.toString() === id)
      if (foundClinic) {
        setClinic(foundClinic)
      } else {
        showToast('Clinic not found', 'error')
        navigate('/book')
      }
      setLoading(false)
    }
  }, [id, clinics, location.state, navigate, showToast])

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor)
    showToast(`Appointment booking for Dr. ${doctor.name} will be available soon!`, 'info')
  }

  const handleBackToMap = () => {
    navigate('/book')
  }

  if (loading || clinicsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading clinic details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Clinic Not Found</h2>
            <p className="text-slate-600 mb-4">The requested clinic could not be found.</p>
            <button
              onClick={handleBackToMap}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Map
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBackToMap}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Map
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {clinic.facilityType === 'hospital' ? (
                    <Building2 className="h-8 w-8 text-red-600" />
                  ) : (
                    <Stethoscope className="h-8 w-8 text-emerald-600" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">{clinic.name}</h1>
                    <span className="text-sm text-slate-500 capitalize">
                      {clinic.facilityType === 'hospital' ? 'Hospital' : 'Clinic'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-slate-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{clinic.address || 'Address not available'}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-xs text-yellow-700 font-medium">Rating</p>
                      <p className="text-lg font-bold text-yellow-900">{clinic.rating} ⭐</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-blue-700 font-medium">Patients</p>
                      <p className="text-lg font-bold text-blue-900">{clinic.patientCount}+</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-orange-700 font-medium">Wait Time</p>
                      <p className="text-lg font-bold text-orange-900">~{clinic.stats?.estimatedWaitTime || 0}min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-lg p-3">
                    <UserCheck className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-purple-700 font-medium">In Queue</p>
                      <p className="text-lg font-bold text-purple-900">{clinic.stats?.totalInQueue || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {clinic.distance && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Navigation className="h-4 w-4" />
                  {clinic.distance} km away
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-emerald-600" />
            Available Doctors
            <span className="text-sm font-normal text-slate-500">
              ({clinic.doctors?.length || 0} doctors available)
            </span>
          </h2>

          {clinic.doctors && clinic.doctors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {clinic.doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white/60 border border-white/40 rounded-xl p-4 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{doctor.name}</h3>
                      <p className="text-sm text-slate-600">{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-slate-600">
                        <span className="font-medium text-green-700">{doctor.availableSlots}</span> slots
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-slate-600">
                        <span className="font-medium text-blue-700">{doctor.patientCount}</span> patients
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookAppointment(doctor)}
                    disabled={doctor.availableSlots === 0}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      doctor.availableSlots > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {doctor.availableSlots > 0 ? 'Book Appointment' : 'No Slots Available'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No doctors available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}