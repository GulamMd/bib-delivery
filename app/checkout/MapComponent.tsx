"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";

export default function MapComponent({
  location,
  setLocation,
  setStreet,
  setCity,
  setZip,
}: any) {
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setStreet(data.display_name);
              // Optionally parse city and zip
              if (data.address) {
                setCity(data.address.city || data.address.town || "");
                setZip(data.address.postcode || "");
              }
            }
          });
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  }
  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={14}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
