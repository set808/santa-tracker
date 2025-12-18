import { DeliveryStop } from 'shared-types';

// Major cities across the world, organized by time zone for optimal delivery
const WORLD_CITIES: Omit<DeliveryStop, 'id' | 'delivered' | 'deliveryTime'>[] = [
  // Pacific Islands (UTC+12/+13) - Start here to follow night
  { city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', location: { lat: -36.8485, lng: 174.7633, altitude: 0 }, population: 1657200, estimatedGifts: 3314400, timeZone: 'Pacific/Auckland' },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', location: { lat: -33.8688, lng: 151.2093, altitude: 0 }, population: 5312000, estimatedGifts: 10624000, timeZone: 'Australia/Sydney' },

  // Asia (UTC+8/+9)
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', location: { lat: 35.6762, lng: 139.6503, altitude: 0 }, population: 37400000, estimatedGifts: 74800000, timeZone: 'Asia/Tokyo' },
  { city: 'Seoul', country: 'South Korea', countryCode: 'KR', location: { lat: 37.5665, lng: 126.9780, altitude: 0 }, population: 25600000, estimatedGifts: 51200000, timeZone: 'Asia/Seoul' },
  { city: 'Beijing', country: 'China', countryCode: 'CN', location: { lat: 39.9042, lng: 116.4074, altitude: 0 }, population: 21540000, estimatedGifts: 43080000, timeZone: 'Asia/Shanghai' },
  { city: 'Shanghai', country: 'China', countryCode: 'CN', location: { lat: 31.2304, lng: 121.4737, altitude: 0 }, population: 27058000, estimatedGifts: 54116000, timeZone: 'Asia/Shanghai' },
  { city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', location: { lat: 22.3193, lng: 114.1694, altitude: 0 }, population: 7482000, estimatedGifts: 14964000, timeZone: 'Asia/Hong_Kong' },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', location: { lat: 1.3521, lng: 103.8198, altitude: 0 }, population: 5686000, estimatedGifts: 11372000, timeZone: 'Asia/Singapore' },
  { city: 'Bangkok', country: 'Thailand', countryCode: 'TH', location: { lat: 13.7563, lng: 100.5018, altitude: 0 }, population: 10539000, estimatedGifts: 21078000, timeZone: 'Asia/Bangkok' },

  // India (UTC+5:30)
  { city: 'Mumbai', country: 'India', countryCode: 'IN', location: { lat: 19.0760, lng: 72.8777, altitude: 0 }, population: 20411000, estimatedGifts: 40822000, timeZone: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', countryCode: 'IN', location: { lat: 28.7041, lng: 77.1025, altitude: 0 }, population: 30291000, estimatedGifts: 60582000, timeZone: 'Asia/Kolkata' },
  { city: 'Bangalore', country: 'India', countryCode: 'IN', location: { lat: 12.9716, lng: 77.5946, altitude: 0 }, population: 12442000, estimatedGifts: 24884000, timeZone: 'Asia/Kolkata' },

  // Middle East (UTC+3/+4)
  { city: 'Dubai', country: 'UAE', countryCode: 'AE', location: { lat: 25.2048, lng: 55.2708, altitude: 0 }, population: 3331000, estimatedGifts: 6662000, timeZone: 'Asia/Dubai' },
  { city: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', location: { lat: 24.7136, lng: 46.6753, altitude: 0 }, population: 7231000, estimatedGifts: 14462000, timeZone: 'Asia/Riyadh' },
  { city: 'Istanbul', country: 'Turkey', countryCode: 'TR', location: { lat: 41.0082, lng: 28.9784, altitude: 0 }, population: 15462000, estimatedGifts: 30924000, timeZone: 'Europe/Istanbul' },

  // Africa (UTC+1/+2)
  { city: 'Cairo', country: 'Egypt', countryCode: 'EG', location: { lat: 30.0444, lng: 31.2357, altitude: 0 }, population: 20901000, estimatedGifts: 41802000, timeZone: 'Africa/Cairo' },
  { city: 'Lagos', country: 'Nigeria', countryCode: 'NG', location: { lat: 6.5244, lng: 3.3792, altitude: 0 }, population: 14368000, estimatedGifts: 28736000, timeZone: 'Africa/Lagos' },
  { city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', location: { lat: -26.2041, lng: 28.0473, altitude: 0 }, population: 5926000, estimatedGifts: 11852000, timeZone: 'Africa/Johannesburg' },
  { city: 'Nairobi', country: 'Kenya', countryCode: 'KE', location: { lat: -1.2864, lng: 36.8172, altitude: 0 }, population: 4922000, estimatedGifts: 9844000, timeZone: 'Africa/Nairobi' },

  // Europe (UTC+0/+1)
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', location: { lat: 51.5074, lng: -0.1278, altitude: 0 }, population: 9304000, estimatedGifts: 18608000, timeZone: 'Europe/London' },
  { city: 'Paris', country: 'France', countryCode: 'FR', location: { lat: 48.8566, lng: 2.3522, altitude: 0 }, population: 11020000, estimatedGifts: 22040000, timeZone: 'Europe/Paris' },
  { city: 'Berlin', country: 'Germany', countryCode: 'DE', location: { lat: 52.5200, lng: 13.4050, altitude: 0 }, population: 3769000, estimatedGifts: 7538000, timeZone: 'Europe/Berlin' },
  { city: 'Madrid', country: 'Spain', countryCode: 'ES', location: { lat: 40.4168, lng: -3.7038, altitude: 0 }, population: 6642000, estimatedGifts: 13284000, timeZone: 'Europe/Madrid' },
  { city: 'Rome', country: 'Italy', countryCode: 'IT', location: { lat: 41.9028, lng: 12.4964, altitude: 0 }, population: 4342000, estimatedGifts: 8684000, timeZone: 'Europe/Rome' },
  { city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', location: { lat: 52.3676, lng: 4.9041, altitude: 0 }, population: 2431000, estimatedGifts: 4862000, timeZone: 'Europe/Amsterdam' },
  { city: 'Brussels', country: 'Belgium', countryCode: 'BE', location: { lat: 50.8503, lng: 4.3517, altitude: 0 }, population: 2081000, estimatedGifts: 4162000, timeZone: 'Europe/Brussels' },
  { city: 'Stockholm', country: 'Sweden', countryCode: 'SE', location: { lat: 59.3293, lng: 18.0686, altitude: 0 }, population: 1632000, estimatedGifts: 3264000, timeZone: 'Europe/Stockholm' },
  { city: 'Copenhagen', country: 'Denmark', countryCode: 'DK', location: { lat: 55.6761, lng: 12.5683, altitude: 0 }, population: 1346000, estimatedGifts: 2692000, timeZone: 'Europe/Copenhagen' },
  { city: 'Moscow', country: 'Russia', countryCode: 'RU', location: { lat: 55.7558, lng: 37.6173, altitude: 0 }, population: 12538000, estimatedGifts: 25076000, timeZone: 'Europe/Moscow' },

  // South America (UTC-3 to -5)
  { city: 'São Paulo', country: 'Brazil', countryCode: 'BR', location: { lat: -23.5505, lng: -46.6333, altitude: 0 }, population: 22043000, estimatedGifts: 44086000, timeZone: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', location: { lat: -22.9068, lng: -43.1729, altitude: 0 }, population: 13458000, estimatedGifts: 26916000, timeZone: 'America/Sao_Paulo' },
  { city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', location: { lat: -34.6037, lng: -58.3816, altitude: 0 }, population: 15154000, estimatedGifts: 30308000, timeZone: 'America/Argentina/Buenos_Aires' },
  { city: 'Lima', country: 'Peru', countryCode: 'PE', location: { lat: -12.0464, lng: -77.0428, altitude: 0 }, population: 10719000, estimatedGifts: 21438000, timeZone: 'America/Lima' },
  { city: 'Bogotá', country: 'Colombia', countryCode: 'CO', location: { lat: 4.7110, lng: -74.0721, altitude: 0 }, population: 10978000, estimatedGifts: 21956000, timeZone: 'America/Bogota' },

  // North America (UTC-5 to -8)
  { city: 'New York', country: 'United States', countryCode: 'US', location: { lat: 40.7128, lng: -74.0060, altitude: 0 }, population: 19426000, estimatedGifts: 38852000, timeZone: 'America/New_York' },
  { city: 'Los Angeles', country: 'United States', countryCode: 'US', location: { lat: 34.0522, lng: -118.2437, altitude: 0 }, population: 13310000, estimatedGifts: 26620000, timeZone: 'America/Los_Angeles' },
  { city: 'Chicago', country: 'United States', countryCode: 'US', location: { lat: 41.8781, lng: -87.6298, altitude: 0 }, population: 9458000, estimatedGifts: 18916000, timeZone: 'America/Chicago' },
  { city: 'Toronto', country: 'Canada', countryCode: 'CA', location: { lat: 43.6532, lng: -79.3832, altitude: 0 }, population: 6313000, estimatedGifts: 12626000, timeZone: 'America/Toronto' },
  { city: 'Mexico City', country: 'Mexico', countryCode: 'MX', location: { lat: 19.4326, lng: -99.1332, altitude: 0 }, population: 21804000, estimatedGifts: 43608000, timeZone: 'America/Mexico_City' },
  { city: 'Vancouver', country: 'Canada', countryCode: 'CA', location: { lat: 49.2827, lng: -123.1207, altitude: 0 }, population: 2632000, estimatedGifts: 5264000, timeZone: 'America/Vancouver' },
  { city: 'San Francisco', country: 'United States', countryCode: 'US', location: { lat: 37.7749, lng: -122.4194, altitude: 0 }, population: 4749000, estimatedGifts: 9498000, timeZone: 'America/Los_Angeles' },
  { city: 'Seattle', country: 'United States', countryCode: 'US', location: { lat: 47.6062, lng: -122.3321, altitude: 0 }, population: 4018000, estimatedGifts: 8036000, timeZone: 'America/Los_Angeles' },
];

export function generateRoute(): DeliveryStop[] {
  return WORLD_CITIES.map((city, index) => ({
    id: `stop-${index + 1}`,
    ...city,
    delivered: false
  }));
}
