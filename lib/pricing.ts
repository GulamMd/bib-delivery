// Basic pricing config
const PRICING = {
  BASE_FARE: 40,
  PER_KM: 10,
  MIN_DISTANCE: 1
};

export function calculateDistanceDiff(lat1: number, lng1: number, lat2: number, lng2: number) {
  // Use Haversine or simple mock
  // For now, mock random distance between 2 and 15 km
  return Number((Math.random() * 13 + 2).toFixed(1));
}

export function calculateDeliveryFee(distanceKm: number) {
  const dist = Math.max(distanceKm, PRICING.MIN_DISTANCE);
  // Formula: Base + (Dist - 1) * Rate ? Or just flat?
  // Let's do: Base for first 2 km, then per km.
  // Implementation: Base + (dist * rate)
  return Math.ceil(PRICING.BASE_FARE + (dist * PRICING.PER_KM));
}

export async function checkPinCodeAvailability(pincode: string) {
  // Mock check. 
  // Allowed: 700001 to 700150 (Kolkata range approx)
  const pin = parseInt(pincode);
  return pin >= 700001 && pin <= 700150;
}
