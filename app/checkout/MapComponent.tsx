import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";

// Helper to update map view when location prop changes
function MapController({ location }: { location: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], map.getZoom(), { animate: true });
    }
  }, [location, map]);
  return null;
}

export default function MapComponent({
  location,
  setLocation,
  setStreet,
  setCity,
  setZip,
  userLocation,
}: any) {
  const [isDrag, setIsDrag] = useState(false);

  function MapEvents() {
    const map = useMap();
    
    useMapEvents({
      dragstart: () => {
        setIsDrag(true);
      },
      dragend: () => {
        setIsDrag(false);
        const center = map.getCenter();
        handleLocationSelect({ lat: center.lat, lng: center.lng });
      },
      zoomend: () => {
        const center = map.getCenter();
        handleLocationSelect({ lat: center.lat, lng: center.lng });
      }
    });

    return null;
  }

  const handleLocationSelect = async (latlng: { lat: number; lng: number }) => {
    setLocation(latlng);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setStreet(data.display_name);
        if (data.address) {
          setCity(data.address.city || data.address.town || data.address.village || "");
          setZip(data.address.postcode || "");
        }
      }
    } catch (error) {
      console.error("Failed to fetch address", error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={16}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController location={location} />
        
        {/* User's current location marker (Blue dot) */}
        {userLocation && (
             <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={divIcon({
                    className: "bg-transparent",
                    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg pulse-ring"></div>`
                })}
             />
        )}

        <MapEvents />
      </MapContainer>
      
      {/* Center Pin UI */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
        <div className={`transition-all duration-300 ${isDrag ? '-translate-y-2' : ''}`}>
          <div className="text-primary drop-shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-red-600"
            >
              <path d="M12 0c-4.418 0-8 3.582-8 8 0 5.25 8 16 8 16s8-10.75 8-16c0-4.418-3.582-8-8-8zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
            </svg>
          </div>
          <div className="w-2 h-1 bg-black/20 rounded-full mx-auto mt-[-2px] blur-[1px]" />
        </div>
      </div>

    </div>
  );
}
