'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons for different request statuses
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

const icons = {
  open: createCustomIcon('#dc2626'),    // red
  claimed: createCustomIcon('#ea580c'), // orange  
  fulfilled: createCustomIcon('#16a34a'), // green
  offer: createCustomIcon('#2563eb'),   // blue
  zone: createCustomIcon('#9333ea'),    // purple
}

interface Request {
  id: string
  title: string
  description: string
  category: string
  urgency: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'Claimed' | 'Fulfilled'
  contact_name: string
  contact_phone: string
  gps_lat: number
  gps_lng: number
  created_at: string
}

interface Offer {
  id: string
  description: string
  category: string
  contact_name: string
  contact_phone: string
  gps_lat: number
  gps_lng: number
}

interface Zone {
  id: string
  type: string
  description: string
  gps_lat: number
  gps_lng: number
  contact_info: string
}

interface DisasterMapProps {
  requests?: Request[]
  offers?: Offer[]
  zones?: Zone[]
  showHeatmap?: boolean
}

// Heatmap layer component (will be implemented later with leaflet.heat)
function HeatmapLayer({ requests }: { requests: Request[] }) {
  const map = useMap()
  
  useEffect(() => {
    // TODO: Implement heatmap using leaflet.heat
    // const heatData = requests.map(r => [r.gps_lat, r.gps_lng, urgencyWeight(r.urgency)])
    // const heat = L.heatLayer(heatData, { radius: 25, maxZoom: 17 })
    // heat.addTo(map)
  }, [map, requests])
  
  return null
}

export default function DisasterMap({ 
  requests = [], 
  offers = [], 
  zones = [],
  showHeatmap = false 
}: DisasterMapProps) {
  const [center] = useState<[number, number]>([33.7490, -84.3880]) // Atlanta, GA default
  const [zoom] = useState(10)

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render request markers */}
        {requests.map((request) => (
          <Marker
            key={request.id}
            position={[request.gps_lat, request.gps_lng]}
            icon={icons[request.status.toLowerCase() as keyof typeof icons]}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <h3 className="font-semibold text-sm mb-1">{request.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{request.description}</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Category:</span>
                    <span className="font-medium">{request.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgency:</span>
                    <span className={`font-medium ${
                      request.urgency === 'High' ? 'text-red-600' :
                      request.urgency === 'Medium' ? 'text-orange-600' :
                      'text-yellow-600'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      request.status === 'Open' ? 'text-red-600' :
                      request.status === 'Claimed' ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  {request.status === 'Open' && (
                    <button className="w-full mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded hover:bg-blue-700">
                      Claim Request
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render offer markers */}
        {offers.map((offer) => (
          <Marker
            key={offer.id}
            position={[offer.gps_lat, offer.gps_lng]}
            icon={icons.offer}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <h3 className="font-semibold text-sm mb-1">Offer: {offer.category}</h3>
                <p className="text-xs text-gray-600 mb-2">{offer.description}</p>
                <div className="text-xs">
                  <p><strong>Contact:</strong> {offer.contact_name}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render zone markers */}
        {zones.map((zone) => (
          <Marker
            key={zone.id}
            position={[zone.gps_lat, zone.gps_lng]}
            icon={icons.zone}
          >
            <Popup>
              <div className="p-2 min-w-48">
                <h3 className="font-semibold text-sm mb-1">{zone.type} Zone</h3>
                <p className="text-xs text-gray-600 mb-2">{zone.description}</p>
                <div className="text-xs">
                  <p><strong>Info:</strong> {zone.contact_info}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Heatmap layer */}
        {showHeatmap && <HeatmapLayer requests={requests} />}
      </MapContainer>
    </div>
  )
}
