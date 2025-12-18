/**
 * Pre-defined NRQL queries for Santa Tracker
 *
 * This module contains ready-to-use NRQL queries for monitoring Santa's journey,
 * workshop operations, reindeer health, and other critical metrics.
 */

import type { NRQLQueryConfig } from '../types/new-relic';

/**
 * Time window constants (in seconds)
 */
export const TIME_WINDOWS = {
  LAST_MINUTE: 60,
  LAST_5_MINUTES: 300,
  LAST_15_MINUTES: 900,
  LAST_HOUR: 3600,
  LAST_24_HOURS: 86400,
} as const;

/**
 * Refresh interval constants (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  REALTIME: 1000,      // 1 second - for critical real-time data
  FAST: 5000,          // 5 seconds - for frequently changing data
  NORMAL: 15000,       // 15 seconds - for standard monitoring
  SLOW: 60000,         // 1 minute - for less critical data
  VERY_SLOW: 300000,   // 5 minutes - for historical/aggregate data
} as const;

/**
 * Query to get Santa's latest location
 *
 * Returns the most recent position, altitude, speed, and delivery progress
 */
export const santaLocationQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latest(latitude) as latitude,
      latest(longitude) as longitude,
      latest(city) as city,
      latest(country) as country,
      latest(region) as region,
      latest(altitude) as altitude,
      latest(speed) as speed,
      latest(heading) as heading,
      latest(presentsDelivered) as presentsDelivered,
      latest(presentsRemaining) as presentsRemaining,
      latest(nextStop) as nextStop,
      latest(timestamp) as timestamp
    FROM SantaLocationUpdate
    SINCE ${TIME_WINDOWS.LAST_MINUTE} seconds ago
    LIMIT 1
  `.trim(),
  description: 'Get Santa\'s current location and delivery progress',
  refreshInterval: REFRESH_INTERVALS.REALTIME,
  visualizationType: 'map',
};

/**
 * Query to get Santa's location history (breadcrumb trail)
 *
 * Returns the path Santa has traveled over the last hour
 */
export const santaLocationHistoryQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latitude,
      longitude,
      city,
      country,
      altitude,
      speed,
      presentsDelivered,
      timestamp
    FROM SantaLocationUpdate
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
    ORDER BY timestamp DESC
    LIMIT 100
  `.trim(),
  description: 'Get Santa\'s location history for the past hour',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'line',
};

/**
 * Query to get reindeer team status
 *
 * Returns health, energy, and mood for each reindeer
 */
export const reindeerStatusQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latest(health) as health,
      latest(energy) as energy,
      latest(mood) as mood,
      latest(position) as position,
      latest(specialAbility) as specialAbility,
      latest(timestamp) as timestamp
    FROM ReindeerStatusUpdate
    FACET name
    SINCE ${TIME_WINDOWS.LAST_5_MINUTES} seconds ago
  `.trim(),
  description: 'Get current status of all reindeer team members',
  refreshInterval: REFRESH_INTERVALS.FAST,
  visualizationType: 'table',
};

/**
 * Query to get reindeer health over time
 *
 * Returns time series of reindeer health metrics
 */
export const reindeerHealthTrendQuery: NRQLQueryConfig = {
  query: `
    SELECT
      average(health) as avgHealth,
      min(health) as minHealth,
      max(health) as maxHealth,
      average(energy) as avgEnergy
    FROM ReindeerStatusUpdate
    FACET name
    TIMESERIES 5 minutes
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
  `.trim(),
  description: 'Get reindeer health trends over the past hour',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'line',
};

/**
 * Query to get workshop production metrics
 *
 * Returns current workshop operational status and production rates
 */
export const workshopMetricsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latest(toysProduced) as toysProduced,
      latest(productionRate) as productionRate,
      latest(elvesWorking) as elvesWorking,
      latest(elvesOnBreak) as elvesOnBreak,
      latest(machinesOperational) as machinesOperational,
      latest(machinesUnderMaintenance) as machinesUnderMaintenance,
      latest(qualityScore) as qualityScore,
      latest(timestamp) as timestamp
    FROM WorkshopMetrics
    SINCE ${TIME_WINDOWS.LAST_5_MINUTES} seconds ago
    LIMIT 1
  `.trim(),
  description: 'Get current workshop production metrics and status',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'billboard',
};

/**
 * Query to get workshop production trends
 *
 * Returns production metrics over time
 */
export const workshopProductionTrendQuery: NRQLQueryConfig = {
  query: `
    SELECT
      average(productionRate) as avgProductionRate,
      sum(toysProduced) as totalToysProduced,
      average(qualityScore) as avgQualityScore
    FROM WorkshopMetrics
    TIMESERIES 15 minutes
    SINCE ${TIME_WINDOWS.LAST_24_HOURS} seconds ago
  `.trim(),
  description: 'Get workshop production trends over 24 hours',
  refreshInterval: REFRESH_INTERVALS.SLOW,
  visualizationType: 'line',
};

/**
 * Query to get gift delivery statistics
 *
 * Returns aggregate delivery metrics and progress
 */
export const deliveryStatsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      sum(giftsDelivered) as totalGiftsDelivered,
      rate(sum(giftsDelivered), 1 minute) as deliveryRate,
      uniqueCount(city) as citiesVisited,
      uniqueCount(country) as countriesVisited,
      average(timestamp) as timestamp
    FROM GiftDelivery
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
  `.trim(),
  description: 'Get aggregate gift delivery statistics',
  refreshInterval: REFRESH_INTERVALS.FAST,
  visualizationType: 'billboard',
};

/**
 * Query to get delivery by country
 *
 * Returns gift delivery counts by country
 */
export const deliveryByCountryQuery: NRQLQueryConfig = {
  query: `
    SELECT
      sum(giftsDelivered) as giftsDelivered,
      count(*) as deliveryCount
    FROM GiftDelivery
    FACET country
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
    LIMIT 50
  `.trim(),
  description: 'Get gift delivery counts by country',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'bar',
};

/**
 * Query to get delivery timeline
 *
 * Returns gift delivery rates over time
 */
export const deliveryTimelineQuery: NRQLQueryConfig = {
  query: `
    SELECT
      sum(giftsDelivered) as giftsDelivered,
      uniqueCount(city) as citiesVisited
    FROM GiftDelivery
    TIMESERIES 10 minutes
    SINCE ${TIME_WINDOWS.LAST_24_HOURS} seconds ago
  `.trim(),
  description: 'Get gift delivery timeline over 24 hours',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'line',
};

/**
 * Query to get active Santa incidents
 *
 * Returns all unresolved incidents requiring attention
 */
export const activeIncidentsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      id,
      type,
      severity,
      description,
      status,
      reportedAt,
      assignedTo
    FROM SantaIncident
    WHERE status != 'resolved'
    SINCE ${TIME_WINDOWS.LAST_24_HOURS} seconds ago
    ORDER BY severity DESC, reportedAt DESC
    LIMIT 20
  `.trim(),
  description: 'Get all active incidents requiring attention',
  refreshInterval: REFRESH_INTERVALS.FAST,
  visualizationType: 'table',
};

/**
 * Query to get incident statistics
 *
 * Returns incident counts by type and severity
 */
export const incidentStatsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      count(*) as incidentCount
    FROM SantaIncident
    FACET type, severity
    SINCE ${TIME_WINDOWS.LAST_24_HOURS} seconds ago
  `.trim(),
  description: 'Get incident statistics by type and severity',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'bar',
};

/**
 * Query to get sleigh health metrics
 *
 * Returns current sleigh system status and health indicators
 */
export const sleighHealthQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latest(overallHealth) as overallHealth,
      latest(engineStatus) as engineStatus,
      latest(navigationStatus) as navigationStatus,
      latest(presentCapacity) as presentCapacity,
      latest(presentLoad) as presentLoad,
      latest(fuelLevel) as fuelLevel,
      latest(magicPowerLevel) as magicPowerLevel,
      latest(lastMaintenance) as lastMaintenance,
      latest(nextMaintenanceDue) as nextMaintenanceDue,
      latest(timestamp) as timestamp
    FROM SleighHealth
    SINCE ${TIME_WINDOWS.LAST_5_MINUTES} seconds ago
    LIMIT 1
  `.trim(),
  description: 'Get current sleigh health and system status',
  refreshInterval: REFRESH_INTERVALS.FAST,
  visualizationType: 'gauge',
};

/**
 * Query to get sleigh health trends
 *
 * Returns sleigh health metrics over time
 */
export const sleighHealthTrendQuery: NRQLQueryConfig = {
  query: `
    SELECT
      average(overallHealth) as avgHealth,
      average(fuelLevel) as avgFuel,
      average(magicPowerLevel) as avgMagicPower
    FROM SleighHealth
    TIMESERIES 5 minutes
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
  `.trim(),
  description: 'Get sleigh health trends over the past hour',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'line',
};

/**
 * Query to get weather conditions along Santa's route
 *
 * Returns current weather at Santa's location
 */
export const weatherConditionsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      latest(temperature) as temperature,
      latest(conditions) as conditions,
      latest(visibility) as visibility,
      latest(windSpeed) as windSpeed,
      latest(windDirection) as windDirection,
      latest(precipitation) as precipitation,
      latest(cloudCover) as cloudCover,
      latest(timestamp) as timestamp
    FROM WeatherConditions
    SINCE ${TIME_WINDOWS.LAST_5_MINUTES} seconds ago
    LIMIT 1
  `.trim(),
  description: 'Get current weather conditions at Santa\'s location',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'billboard',
};

/**
 * Query to get page view statistics
 *
 * Returns page view counts and performance metrics
 */
export const pageViewStatsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      count(*) as pageViews,
      uniqueCount(session) as uniqueSessions,
      average(timeSpent) as avgTimeSpent
    FROM PageView
    FACET pageName
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
  `.trim(),
  description: 'Get page view statistics for the application',
  refreshInterval: REFRESH_INTERVALS.SLOW,
  visualizationType: 'bar',
};

/**
 * Query to get user interaction statistics
 *
 * Returns counts of user actions and interactions
 */
export const userInteractionStatsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      count(*) as interactionCount
    FROM PageAction
    FACET actionName
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
    LIMIT 20
  `.trim(),
  description: 'Get user interaction statistics',
  refreshInterval: REFRESH_INTERVALS.SLOW,
  visualizationType: 'bar',
};

/**
 * Query to get application error rate
 *
 * Returns JavaScript error counts and rates
 */
export const errorRateQuery: NRQLQueryConfig = {
  query: `
    SELECT
      count(*) as errorCount,
      rate(count(*), 1 minute) as errorRate
    FROM JavaScriptError
    FACET errorMessage
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
    LIMIT 10
  `.trim(),
  description: 'Get JavaScript error rate for the application',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'table',
};

/**
 * Query to get application performance metrics
 *
 * Returns page load times and performance indicators
 */
export const performanceMetricsQuery: NRQLQueryConfig = {
  query: `
    SELECT
      average(duration) as avgPageLoad,
      percentile(duration, 50, 75, 95, 99) as percentiles
    FROM PageView
    TIMESERIES 5 minutes
    SINCE ${TIME_WINDOWS.LAST_HOUR} seconds ago
  `.trim(),
  description: 'Get application performance metrics',
  refreshInterval: REFRESH_INTERVALS.NORMAL,
  visualizationType: 'line',
};

/**
 * Export all queries as a collection for easy access
 */
export const SANTA_TRACKER_QUERIES = {
  // Santa Location
  santaLocation: santaLocationQuery,
  santaLocationHistory: santaLocationHistoryQuery,

  // Reindeer
  reindeerStatus: reindeerStatusQuery,
  reindeerHealthTrend: reindeerHealthTrendQuery,

  // Workshop
  workshopMetrics: workshopMetricsQuery,
  workshopProductionTrend: workshopProductionTrendQuery,

  // Deliveries
  deliveryStats: deliveryStatsQuery,
  deliveryByCountry: deliveryByCountryQuery,
  deliveryTimeline: deliveryTimelineQuery,

  // Incidents
  activeIncidents: activeIncidentsQuery,
  incidentStats: incidentStatsQuery,

  // Sleigh
  sleighHealth: sleighHealthQuery,
  sleighHealthTrend: sleighHealthTrendQuery,

  // Weather
  weatherConditions: weatherConditionsQuery,

  // Application Monitoring
  pageViewStats: pageViewStatsQuery,
  userInteractionStats: userInteractionStatsQuery,
  errorRate: errorRateQuery,
  performanceMetrics: performanceMetricsQuery,
} as const;

/**
 * Helper function to create a custom query config
 *
 * @param query - The NRQL query string
 * @param options - Additional query configuration options
 * @returns A complete NRQLQueryConfig object
 *
 * @example
 * ```typescript
 * const customQuery = createQueryConfig(
 *   'SELECT * FROM CustomEvent WHERE foo = "bar"',
 *   {
 *     description: 'My custom query',
 *     refreshInterval: REFRESH_INTERVALS.FAST,
 *     visualizationType: 'table',
 *   }
 * );
 * ```
 */
export function createQueryConfig(
  query: string,
  options: Omit<NRQLQueryConfig, 'query'>
): NRQLQueryConfig {
  return {
    query: query.trim(),
    ...options,
  };
}
