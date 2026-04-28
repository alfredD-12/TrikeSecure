const DEFAULT_URBAN_SPEED_KMH = 18;

export function hasCoords(point) {
  return Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng));
}

export function distanceKm(from, to) {
  if (!hasCoords(from) || !hasCoords(to)) {
    return null;
  }

  const earthRadiusKm = 6371;
  const lat1 = Number(from.lat) * Math.PI / 180;
  const lat2 = Number(to.lat) * Math.PI / 180;
  const deltaLat = (Number(to.lat) - Number(from.lat)) * Math.PI / 180;
  const deltaLng = (Number(to.lng) - Number(from.lng)) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

export function formatDistance(km) {
  if (!Number.isFinite(km)) {
    return '--';
  }

  if (km < 1) {
    return `${Math.max(20, Math.round(km * 1000 / 10) * 10)} m`;
  }

  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

export function estimateMinutes(km, speedKmh = DEFAULT_URBAN_SPEED_KMH) {
  if (!Number.isFinite(km)) {
    return null;
  }

  return Math.max(1, Math.round((km / speedKmh) * 60));
}

export function formatEta(minutes) {
  if (!Number.isFinite(minutes)) {
    return '--';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function ridePoint(ride, type) {
  if (!ride) {
    return null;
  }

  if (type === 'pickup') {
    return ride.pickupLat != null && ride.pickupLng != null
      ? { lat: ride.pickupLat, lng: ride.pickupLng, label: ride.pickupLocation || 'Pickup' }
      : null;
  }

  if (type === 'dropoff') {
    return ride.dropoffLat != null && ride.dropoffLng != null
      ? { lat: ride.dropoffLat, lng: ride.dropoffLng, label: ride.dropoffLocation || 'Dropoff' }
      : null;
  }

  if (type === 'driver') {
    return ride.driverLocation?.lat != null && ride.driverLocation?.lng != null
      ? { lat: ride.driverLocation.lat, lng: ride.driverLocation.lng, label: 'Driver' }
      : null;
  }

  return null;
}

export function travelSummary(from, to, speedKmh = DEFAULT_URBAN_SPEED_KMH) {
  const km = distanceKm(from, to);
  const minutes = estimateMinutes(km, speedKmh);

  return {
    distance: formatDistance(km),
    distanceKm: km,
    eta: formatEta(minutes),
    minutes,
  };
}

export function googleMapsDirectionsUrl(destination, origin = null) {
  if (!hasCoords(destination)) {
    return null;
  }

  const params = new URLSearchParams({
    api: '1',
    destination: `${destination.lat},${destination.lng}`,
    travelmode: 'driving',
  });

  if (hasCoords(origin)) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
