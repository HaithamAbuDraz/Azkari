import {
  POPULAR_CITIES,
  calculateDistanceKm,
  getRecommendedMethod,
} from '../constants/prayers.js';

const GEOCODE_TIMEOUT_MS = 3500;
const MAX_NEARBY_CITY_KM = 80;
const LEGACY_GPS_LABELS = new Set(['موقعي الحالي', 'موقعي الحالي (GPS)']);

function cleanPlaceName(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stripAdminPrefix(value) {
  return cleanPlaceName(value)
    .replace(/^(محافظة|منطقة|ولاية|إمارة)\s+/u, '')
    .trim();
}

async function fetchJsonWithTimeout(url, timeoutMs = GEOCODE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromBigDataCloud(lat, lng) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=ar`;
  const data = await fetchJsonWithTimeout(url);
  if (!data || typeof data !== 'object') return null;

  const cityName =
    cleanPlaceName(data.city) ||
    cleanPlaceName(data.locality) ||
    stripAdminPrefix(data.principalSubdivision);

  if (!cityName) return null;

  return {
    cityName,
    countryName: cleanPlaceName(data.countryName),
    countryCode: cleanPlaceName(data.countryCode).toUpperCase(),
  };
}

async function fetchFromNominatim(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&accept-language=ar&zoom=10`;
  const data = await fetchJsonWithTimeout(url);
  const addr = data?.address;
  if (!addr) return null;

  const cityName =
    cleanPlaceName(addr.city) ||
    cleanPlaceName(addr.town) ||
    cleanPlaceName(addr.village) ||
    cleanPlaceName(addr.municipality) ||
    cleanPlaceName(addr.county) ||
    stripAdminPrefix(addr.state);

  if (!cityName) return null;

  return {
    cityName,
    countryName: cleanPlaceName(addr.country),
    countryCode: cleanPlaceName(addr.country_code).toUpperCase(),
  };
}

/**
 * Finds the closest preset city within maxDistanceKm as an offline fallback.
 */
export function findNearestPopularCity(
  lat,
  lng,
  maxDistanceKm = MAX_NEARBY_CITY_KM
) {
  let nearest = null;
  let minDistance = Infinity;

  for (const city of POPULAR_CITIES) {
    const distance = calculateDistanceKm(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = city;
    }
  }

  return minDistance <= maxDistanceKm ? nearest : null;
}

/**
 * Checks whether a saved GPS location is still missing a real resolved city name.
 */
export function isUnresolvedGpsLocation(location) {
  if (!location?.isGps) return false;
  const label = cleanPlaceName(location.label);
  const city = cleanPlaceName(location.city);
  return (
    (!label && !city) ||
    LEGACY_GPS_LABELS.has(label) ||
    LEGACY_GPS_LABELS.has(city)
  );
}

/**
 * Returns a clean, human-readable city name for UI display (or empty string if unresolved).
 */
export function getDisplayCityName(location) {
  if (!location || isUnresolvedGpsLocation(location)) return '';
  return cleanPlaceName(location.label) || cleanPlaceName(location.city);
}

/**
 * Reverse-geocodes GPS coordinates into a full location object with a real city name.
 */
export async function resolveLocationByCoords(lat, lng) {
  const resolved =
    (await fetchFromBigDataCloud(lat, lng)) ||
    (await fetchFromNominatim(lat, lng));

  if (resolved?.cityName) {
    return {
      city: resolved.cityName,
      label: resolved.cityName,
      country: resolved.countryCode,
      countryLabel: resolved.countryName || 'تحديد تلقائي',
      lat,
      lng,
      method: getRecommendedMethod(resolved.countryCode),
      isGps: true,
    };
  }

  const nearby = findNearestPopularCity(lat, lng);
  if (nearby) {
    return {
      ...nearby,
      lat,
      lng,
      isGps: true,
    };
  }

  return {
    city: '',
    label: '',
    country: '',
    countryLabel: 'تحديد تلقائي',
    lat,
    lng,
    method: 3,
    isGps: true,
  };
}
