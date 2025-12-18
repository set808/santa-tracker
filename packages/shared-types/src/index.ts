// Geographic Types
export interface Location {
  lat: number;
  lng: number;
  altitude: number; // feet
}

export interface DeliveryStop {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  location: Location;
  population: number;
  estimatedGifts: number;
  delivered: boolean;
  deliveryTime?: string;
  timeZone: string;
}

// Sleigh Types
export interface SleighMetrics {
  position: Location;
  speed: number; // Mach number
  heading: number; // degrees
  altitude: number; // feet
  magicFuelLevel: number; // percentage
  structuralIntegrity: number; // percentage
  navigationStatus: 'optimal' | 'degraded' | 'critical';
  nextStop: string;
  distanceToNextStop: number; // miles
  timestamp: string;
}

export interface SleighHealth {
  engine: {
    performance: number; // percentage
    temperature: number; // degrees
    magicOutput: number; // gigawatts
  };
  navigation: {
    gpsAccuracy: number; // meters
    starTrackerStatus: 'online' | 'offline';
    compassCalibration: number; // percentage
  };
  communication: {
    northPoleLink: 'connected' | 'disconnected';
    latency: number; // ms
    bandwidth: number; // Mbps
  };
}

// Reindeer Types
export type ReindeerName =
  | 'Dasher'
  | 'Dancer'
  | 'Prancer'
  | 'Vixen'
  | 'Comet'
  | 'Cupid'
  | 'Donner'
  | 'Blitzen'
  | 'Rudolph';

export interface ReindeerStatus {
  name: ReindeerName;
  energy: number; // percentage
  health: number; // percentage
  morale: number; // percentage
  speedContribution: number; // percentage of max speed
  specialAbility?: string; // Rudolph's nose brightness, etc.
  status: 'excellent' | 'good' | 'tired' | 'exhausted' | 'resting';
  position: 'lead' | 'middle' | 'rear';
}

// Workshop Types
export interface WorkshopMetrics {
  activeElves: number;
  totalElves: number;
  productionRate: number; // toys per minute
  qualityScore: number; // percentage
  inventoryLevels: {
    toys: number;
    wrappingPaper: number;
    ribbons: number;
    magicDust: number;
  };
  shifts: {
    current: number;
    total: number;
    changeover: string; // time until next shift
  };
}

export interface ElfMetrics {
  department: 'manufacturing' | 'quality-control' | 'wrapping' | 'logistics';
  productivity: number; // percentage
  shiftStatus: 'active' | 'break' | 'off-duty';
  morale: number; // percentage
}

// Delivery Types
export interface DeliveryMetrics {
  totalGiftsDelivered: number;
  totalGiftsRemaining: number;
  deliveryRate: number; // gifts per second
  countriesVisited: number;
  totalCountries: number;
  currentRegion: string;
  regionalBreakdown: RegionalStats[];
}

export interface RegionalStats {
  region: string;
  countries: string[];
  giftsDelivered: number;
  totalGifts: number;
  percentComplete: number;
  averageDeliveryTime: number; // seconds
}

// Weather Types
export interface WeatherConditions {
  location: string;
  temperature: number; // Fahrenheit
  windSpeed: number; // mph
  windDirection: number; // degrees
  visibility: number; // miles
  precipitation: 'none' | 'light-snow' | 'heavy-snow' | 'rain' | 'blizzard';
  severity: 'clear' | 'moderate' | 'severe' | 'extreme';
  impact: string;
  forecast: string;
}

// Incident Types
export type IncidentType =
  | 'weather-delay'
  | 'reindeer-fatigue'
  | 'chimney-obstruction'
  | 'airspace-conflict'
  | 'fuel-low'
  | 'gift-mismatch'
  | 'navigation-error'
  | 'communication-loss';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved';
  impactedSystems: string[];
  resolutionTime?: string;
  realWorldAnalogy: string;
}

// AI Assistant Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// Route Planning Types
export interface RoutePlan {
  id: string;
  totalDistance: number; // miles
  estimatedDuration: number; // hours
  stops: DeliveryStop[];
  efficiencyScore: number; // percentage
  optimizationMetrics: {
    timeZoneAlignment: number;
    populationDensity: number;
    weatherForecast: number;
    fuelEfficiency: number;
  };
  status: 'analyzing' | 'optimizing' | 'finalized';
}

// New Relic Integration Types
export interface NewRelicEvent {
  eventType: string;
  timestamp: number;
  [key: string]: any;
}

export interface NRQLQuery {
  accountId: string;
  query: string;
  description?: string;
  visualization?: 'line' | 'area' | 'bar' | 'pie' | 'billboard' | 'table';
}

// WebSocket Message Types
export type WSMessageType =
  | 'sleigh-update'
  | 'reindeer-update'
  | 'delivery-update'
  | 'workshop-update'
  | 'weather-update'
  | 'incident-created'
  | 'incident-resolved'
  | 'route-update';

export interface WSMessage {
  type: WSMessageType;
  data: any;
  timestamp: string;
}

// Monitoring & Observability Types
export interface ServiceHealth {
  serviceName: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number; // seconds
  responseTime: number; // ms
  errorRate: number; // percentage
  throughput: number; // requests per second
  lastCheck: string;
}

export interface DistributedTrace {
  traceId: string;
  duration: number; // ms
  services: string[];
  spans: number;
  errors: number;
  timestamp: string;
}

// Christmas Eve Timeline
export interface TimelineState {
  mode: 'route-planning' | 'christmas-eve' | 'post-delivery';
  currentTime: string;
  christmasEveStart: string;
  percentComplete: number;
  phase: string;
}
