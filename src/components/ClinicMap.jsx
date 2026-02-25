import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin, Star, Users, Clock, ArrowRight } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const clinicIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const userIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to update map center
function ChangeView({ center, zoom }) {
  const map = useMap()
  map.setView(center, zoom)
  return null
}

// Enhanced popup component
function ClinicPopup({ clinic, onSelect }) {
  return (
    <Popup className="clinic-popup" minWidth={280}>
      <div className="p-3">
        <div className="mb-3">
          <h3 className="font-bold text-lg text-slate-800 mb-1">{clinic.name}</h3>
          <p className="text-sm text-slate-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {clinic.address || 'Address not available'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-lg p-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-xs text-yellow-700 font-medium">Rating</p>
              <p className="text-sm font-bold text-yellow-900">{clinic.rating || 4.5} ⭐</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg p-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-blue-700 font-medium">Patients</p>
              <p className="text-sm font-bold text-blue-900">{clinic.patientCount || 0}+</p>
            </div>
          </div>
        </div>

        {clinic.stats && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <Clock className="h-3 w-3" />
                Wait: ~{clinic.stats.estimatedWaitTime || 0} mins
              </span>
              <span className="text-slate-600">
                Queue: {clinic.stats.totalInQueue || 0}
              </span>
            </div>
          </div>
        )}

        {clinic.distance && (
          <p className="text-xs text-slate-500 mb-3">
            📍 {clinic.distance} km away
          </p>
        )}

        <button
          onClick={() => onSelect(clinic)}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
        >
          Book Appointment
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Popup>
  )
}

export default function ClinicMap({ 
  clinics = [], 
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13, 
  onClinicSelect,
  userLocation = null,
  className = "",
  height = "400px",
  loading = false // Add loading prop from parent
}) {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(14)
    }
  }, [userLocation])

  const handleClinicSelect = (clinic) => {
    if (onClinicSelect) {
      onClinicSelect(clinic)
    }
  }

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-lg border border-slate-200 ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: height, width: '100%' }}
        className="z-0"
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-800">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Clinic markers */}
        {clinics
          .filter(clinic => clinic.latitude && clinic.longitude)
          .map(clinic => (
            <Marker
              key={clinic.id}
              position={[clinic.latitude, clinic.longitude]}
              icon={clinicIcon}
            >
              <ClinicPopup clinic={clinic} onSelect={handleClinicSelect} />
            </Marker>
          ))}
      </MapContainer>

      {/* Loading overlay - only show when explicitly loading */}
      {loading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-slate-600">Loading clinics...</p>
          </div>
        </div>
      )}
    </div>
  )
}