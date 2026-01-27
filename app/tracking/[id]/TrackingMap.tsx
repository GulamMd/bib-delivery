"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
const defaultIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3063/3063823.png", // Delivery truck or bike icon
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

// Component to fly to the latest relevant point
function MapUpdater({ deliveryLocation, driverLocation }: { deliveryLocation: any, driverLocation?: any }) {
  const map = useMap();
  useEffect(() => {
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      map.flyTo([driverLocation.lat, driverLocation.lng], 15);
    } else if (deliveryLocation && deliveryLocation.lat && deliveryLocation.lng) {
      map.flyTo([deliveryLocation.lat, deliveryLocation.lng], 15);
    }
  }, [deliveryLocation, driverLocation, map]);
  return null;
}

export default function TrackingMap({
  deliveryLocation,
  driverLocation,
}: {
  deliveryLocation: { lat: number; lng: number };
  driverLocation?: { lat: number; lng: number };
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Default to a fallback if location is missing 
  const hasDeliveryLoc = typeof deliveryLocation?.lat === 'number' && typeof deliveryLocation?.lng === 'number';
  const center = hasDeliveryLoc ? [deliveryLocation.lat, deliveryLocation.lng] : [22.5726, 88.3639];

  if (!isMounted) return <div className="h-full w-full bg-muted flex items-center justify-center">Initializing Map...</div>;

  return (
    <div className="h-full w-full">
      <MapContainer
        key={JSON.stringify(center)} // Force remount if center changes significantly or to avoid stale DOM
        center={center as any}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
        dragging={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Delivery Destination Marker */}
        {hasDeliveryLoc && (
          <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={defaultIcon}>
            <Popup>Delivery Location</Popup>
          </Marker>
        )}

        {/* Driver Location Marker */}
        {driverLocation && typeof driverLocation.lat === 'number' && (
          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
            <Popup>Delivery Partner</Popup>
          </Marker>
        )}

        <MapUpdater deliveryLocation={deliveryLocation} driverLocation={driverLocation} />
      </MapContainer>
    </div>
  );
}
