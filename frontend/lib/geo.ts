export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert geotag score based on distance from NGO
export function geotagScore(submittedLat: number, submittedLng: number, ngoLat: number, ngoLng: number) {
  const dist = getDistanceKm(submittedLat, submittedLng, ngoLat, ngoLng);
  if (dist <= 5)  return 100;
  if (dist <= 15) return 85;
  if (dist <= 30) return 65;
  if (dist <= 60) return 40;
  return 10;
}
