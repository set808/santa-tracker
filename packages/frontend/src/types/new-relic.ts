/**
 * TypeScript type definitions for New Relic integration
 */

/**
 * Configuration for a NRQL query
 */
export interface NRQLQueryConfig {
  /** The NRQL query string */
  query: string;
  /** Human-readable description of what the query returns */
  description: string;
  /** How often to refresh the query in milliseconds */
  refreshInterval: number;
  /** Type of visualization recommended for this data */
  visualizationType: 'line' | 'bar' | 'table' | 'billboard' | 'gauge' | 'map' | 'json';
  /** Optional account ID if different from default */
  accountId?: string;
}

/**
 * Response from New Relic NerdGraph query API
 */
export interface NRQLResponse<T = unknown> {
  /** The query results */
  data: T;
  /** Metadata about the query execution */
  metadata?: {
    /** Time range of the query */
    timeRange?: {
      begin: number;
      end: number;
    };
    /** Number of results returned */
    count?: number;
    /** Whether results were sampled */
    sampled?: boolean;
  };
}

/**
 * Error response from NRQL query
 */
export interface NRQLError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** Additional error details */
  details?: Record<string, unknown>;
}

/**
 * Hook state for NRQL queries
 */
export interface UseNRQLQueryState<T> {
  /** Query result data */
  data: T | null;
  /** Whether query is currently loading */
  loading: boolean;
  /** Error if query failed */
  error: NRQLError | null;
  /** Function to manually refetch the query */
  refetch: () => Promise<void>;
}

/**
 * Santa's current location data
 */
export interface SantaLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  region: string;
  altitude: number;
  speed: number;
  heading: number;
  timestamp: number;
  presentsDelivered: number;
  presentsRemaining: number;
  nextStop?: string;
}

/**
 * Reindeer team member status
 */
export interface ReindeerStatus {
  name: string;
  health: number;
  energy: number;
  mood: 'excellent' | 'good' | 'tired' | 'exhausted';
  position: number;
  specialAbility: string;
  timestamp: number;
}

/**
 * Workshop production metrics
 */
export interface WorkshopMetrics {
  toysProduced: number;
  productionRate: number;
  elvesWorking: number;
  elvesOnBreak: number;
  machinesOperational: number;
  machinesUnderMaintenance: number;
  qualityScore: number;
  timestamp: number;
}

/**
 * Gift delivery statistics
 */
export interface DeliveryStats {
  totalGiftsDelivered: number;
  deliveryRate: number;
  citiesVisited: number;
  countriesVisited: number;
  continentsVisited: number;
  averageDeliveryTime: number;
  fastestDelivery: number;
  timestamp: number;
}

/**
 * Santa incident report
 */
export interface SantaIncident {
  id: string;
  type: 'weather' | 'navigation' | 'reindeer' | 'sleigh' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    city?: string;
    country?: string;
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'resolved' | 'monitoring';
  reportedAt: number;
  resolvedAt?: number;
  assignedTo?: string;
}

/**
 * Sleigh health metrics
 */
export interface SleighHealth {
  overallHealth: number;
  engineStatus: 'optimal' | 'good' | 'degraded' | 'critical';
  navigationStatus: 'optimal' | 'good' | 'degraded' | 'critical';
  presentCapacity: number;
  presentLoad: number;
  fuelLevel: number;
  magicPowerLevel: number;
  lastMaintenance: number;
  nextMaintenanceDue: number;
  timestamp: number;
}

/**
 * Weather conditions at Santa's location
 */
export interface WeatherConditions {
  temperature: number;
  conditions: string;
  visibility: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  cloudCover: number;
  timestamp: number;
}

/**
 * NRQL query result for Santa location
 */
export type SantaLocationQueryResult = NRQLResponse<SantaLocation[]>;

/**
 * NRQL query result for reindeer status
 */
export type ReindeerStatusQueryResult = NRQLResponse<ReindeerStatus[]>;

/**
 * NRQL query result for workshop metrics
 */
export type WorkshopMetricsQueryResult = NRQLResponse<WorkshopMetrics[]>;

/**
 * NRQL query result for delivery stats
 */
export type DeliveryStatsQueryResult = NRQLResponse<DeliveryStats[]>;

/**
 * NRQL query result for active incidents
 */
export type ActiveIncidentsQueryResult = NRQLResponse<SantaIncident[]>;

/**
 * NRQL query result for sleigh health
 */
export type SleighHealthQueryResult = NRQLResponse<SleighHealth[]>;

/**
 * Generic NRQL facet result
 */
export interface NRQLFacetResult {
  facet: string | string[];
  count: number;
  [key: string]: unknown;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: number;
  value: number;
}

/**
 * NRQL time series result
 */
export interface NRQLTimeSeriesResult {
  name: string;
  data: TimeSeriesDataPoint[];
}

/**
 * Raw NRQL TIMESERIES response format from NerdGraph
 * Used for queries with TIMESERIES clause
 */
export interface NRQLTimeSeriesBucket {
  beginTimeSeconds: number;
  endTimeSeconds: number;
  [key: string]: number; // e.g., 'average.speed', 'average.altitude', 'count'
}

/**
 * Raw NRQL latest() response format from NerdGraph
 * Used for queries with latest() function
 */
export interface NRQLLatestResult {
  [key: string]: number | string | null; // e.g., 'latest.magicFuelLevel', 'latest.status'
}

/**
 * Raw NRQL FACET response format from NerdGraph
 * Used for queries with FACET clause
 */
export interface NRQLFacetBucket {
  facet: string | string[];
  [key: string]: number | string | string[] | null;
}

/**
 * Generic chart data types for consistent chart component props
 */

/**
 * Time series chart data format
 * Used by TimeSeriesChart component
 */
export interface TimeSeriesChartData {
  timestamp: number;
  [key: string]: number; // Dynamic keys for multiple data series
}

/**
 * Gauge chart data format
 * Used by GaugeChart component
 */
export type GaugeChartData = number;

/**
 * Billboard chart data format
 * Used by BillboardChart component
 */
export type BillboardChartData = number;

/**
 * Bar chart data format
 * Used by BarChart component
 */
export interface BarChartData {
  [key: string]: string | number; // Dynamic keys for x and y values
}

/**
 * Recharts tooltip props
 * Type definition for custom Recharts tooltip components
 */
export interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number;
    dataKey: string;
    payload?: Record<string, unknown>;
  }>;
  label?: string | number;
}
