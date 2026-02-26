import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin, Star, Users, Clock, ArrowRight, Stethoscope, Building2, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'

// Custom marker icons - using reliable colored markers with fallback
const createCustomIcon = (type, zoom, isUserLocation = false) => {
  const size = zoom >= 12 ? 'large' : 'normal'
  const iconSize = size === 'large' ? [35, 50] : [25, 40]
  const iconAnchor = size === 'large' ? [17, 50] : [12, 40]
  
  let iconUrl
  
  try {
    if (isUserLocation) {
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png'
    } else if (type === 'hospital') {
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
    } else {
      iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
    }
    
    return new Icon({
      iconUrl: iconUrl,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: iconSize,
      iconAnchor: iconAnchor,
      popupAnchor: [1, -34], 
      shadowSize: size === 'large' ? [50, 64] : [41, 41],
      shadowAnchor: size === 'large' ? [15, 64] : [12, 41],
      className: `custom-marker ${type} ${size} ${isUserLocation ? 'user-location' : ''}`
    })
  } catch (error) {
    console.warn('Error creating custom icon, using default:', error)
    // Fallback to default leaflet icon
    return new Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  }
}

// Component to update map center - only runs when center/zoom props actually change
function ChangeView({ center, zoom }) {
  const map = useMap()
  const prevCenter = useRef(center)
  const prevZoom = useRef(zoom)

  useEffect(() => {
    const centerChanged = prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]
    const zoomChanged = prevZoom.current !== zoom
    
    if (centerChanged || zoomChanged) {
      map.setView(center, zoom)
      prevCenter.current = center
      prevZoom.current = zoom
    }
  }, [center, zoom, map])

  return null
}

// Component to track zoom changes
function ZoomTracker({ onZoomChange }) {
  const mapEvents = useMapEvents({
    zoomend: () => {
      onZoomChange(mapEvents.getZoom())
    },
    moveend: () => {
      onZoomChange(mapEvents.getZoom())
    }
  })
  return null
}

// Hover card component
function ClinicHoverCard({ clinic, position, visible }) {
  if (!visible || !position) return null
  
  return (
    <div 
      className="absolute z-[1000] pointer-events-none"
      style={{
        left: position.x + 15,
        top: position.y - 15,
        transform: 'translate(0, -100%)'
      }}
    >
      <div className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-lg shadow-xl p-4 min-w-[220px] max-w-[280px] animate-in fade-in duration-200">
        <div className="flex items-center gap-2 mb-3">
          {clinic.facilityType === 'hospital' ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <Building2 className="h-4 w-4 text-red-600" />
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <Stethoscope className="h-4 w-4 text-green-600" />
            </div>
          )}
          <h4 className="font-semibold text-sm text-slate-800 truncate flex-1">{clinic.name}</h4>
        </div>
        
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="font-medium">{clinic.rating || 4.5}</span>
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="font-medium">{clinic.patientCount || 0}+ patients</span>
            </span>
          </div>
          
          {clinic.stats && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-500" />
                <span className="text-orange-600 font-medium">~{clinic.stats.estimatedWaitTime || 0}min wait</span>
              </span>
              <span className="text-slate-500">{clinic.stats.totalInQueue || 0} in queue</span>
            </div>
          )}
          
          {clinic.doctors && clinic.doctors.length > 0 && (
            <div className="text-xs text-emerald-600 pt-1 font-medium">
              {clinic.doctors.length} doctor{clinic.doctors.length !== 1 ? 's' : ''} available
            </div>
          )}
        </div>
        
        <div className="text-xs text-slate-400 mt-3 italic text-center border-t border-slate-100 pt-2">
          Click to view details →
        </div>
      </div>
    </div>
  )
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
  center = [12.9165, 79.1325], // Default to Vellore
  zoom = 13, 
  onClinicSelect,
  userLocation = null,
  className = "",
  height = "400px",
  loading = false // Add loading prop from parent
}) {
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(zoom)
  const [currentZoom, setCurrentZoom] = useState(zoom)
  const [hoveredClinic, setHoveredClinic] = useState(null)
  const [hoverPosition, setHoverPosition] = useState(null)
  const mapRef = useRef(null)
  const navigate = useNavigate()

  // Debug logs to see what we're getting from API
  if (clinics.length > 0) {
    console.log('ClinicMap received', clinics.length, 'clinics. First:', clinics[0]?.name, clinics[0]?.latitude, clinics[0]?.longitude)
  }

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

  const handleClinicClick = (clinic) => {
    navigate(`/clinic/${clinic.id}`, { state: { clinic } })
  }

  const handleMarkerMouseOver = (clinic, event) => {
    const map = mapRef.current
    if (map) {
      const containerPoint = map.latLngToContainerPoint([clinic.latitude, clinic.longitude])
      setHoverPosition({ 
        x: containerPoint.x, 
        y: containerPoint.y 
      })
      setHoveredClinic(clinic)
    }
  }

  const handleMarkerMouseOut = () => {
    // Small delay to prevent flickering when moving between marker and popup
    setTimeout(() => {
      setHoveredClinic(null)
      setHoverPosition(null)
    }, 100)
  }

  const handleZoomChange = (zoom) => {
    setCurrentZoom(zoom)
  }

  return (
    <div className={`relative rounded-xl overflow-hidden shadow-lg border border-slate-200 ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        minZoom={1}
        maxZoom={20}
        zoomControl={true}
        style={{ height: height, width: '100%' }}
        className="z-0"
        ref={mapRef}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        touchZoom={true}
        dragging={true}
        zoomSnap={1}
        zoomDelta={1}
        wheelDebounceTime={40}
        wheelPxPerZoomLevel={60}
      >
        <ChangeView center={mapCenter} zoom={mapZoom} />
        <ZoomTracker onZoomChange={handleZoomChange} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={createCustomIcon('user', currentZoom, true)}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-blue-800 flex items-center gap-2 justify-center">
                  <Navigation className="h-4 w-4" />
                  Your Location
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Clinic markers */}
        {clinics && clinics.length > 0 && (
          clinics
            .filter(clinic => {
              const hasCoords = clinic.latitude && clinic.longitude && 
                              !isNaN(clinic.latitude) && !isNaN(clinic.longitude)
              return hasCoords
            })
            .map((clinic, index) => {
              const facilityType = clinic.facilityType || 'clinic'
              
              return (
                <Marker
                  key={clinic.id || index}
                  position={[parseFloat(clinic.latitude), parseFloat(clinic.longitude)]}
                  icon={createCustomIcon(facilityType, currentZoom)}
                  eventHandlers={{
                    mouseover: (e) => handleMarkerMouseOver(clinic, e),
                    mouseout: handleMarkerMouseOut,
                    click: () => handleClinicClick(clinic)
                  }}
                >
                  <ClinicPopup clinic={clinic} onSelect={handleClinicSelect} />
                </Marker>
              )
            })
        )}
      </MapContainer>

      {/* Hover card overlay */}
      <ClinicHoverCard 
        clinic={hoveredClinic}
        position={hoverPosition}
        visible={!!hoveredClinic}
      />

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