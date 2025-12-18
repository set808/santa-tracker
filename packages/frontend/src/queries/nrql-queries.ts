/**
 * NRQL Query Configurations for Santa Tracker Dashboard
 *
 * This file contains all NRQL queries used to fetch real-time data from New Relic.
 * Each query is configured with appropriate refresh intervals and visualization types.
 */

import type { NRQLQueryConfig } from '../types/new-relic';

// ============================================================================
// SLEIGH METRICS QUERIES
// ============================================================================

export const sleighSpeedQuery: NRQLQueryConfig = {
  query: "SELECT average(speed) FROM SantaLocation SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Santa's sleigh speed over time",
  refreshInterval: 5000, // 5 seconds
  visualizationType: 'line',
};

export const sleighAltitudeQuery: NRQLQueryConfig = {
  query: "SELECT average(altitude) FROM SantaLocation SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Sleigh altitude over time",
  refreshInterval: 5000,
  visualizationType: 'line',
};

export const sleighFuelQuery: NRQLQueryConfig = {
  query: "SELECT latest(magicFuelLevel) as fuel FROM SantaLocation",
  description: "Current magic fuel level",
  refreshInterval: 5000,
  visualizationType: 'gauge',
};

export const sleighIntegrityQuery: NRQLQueryConfig = {
  query: "SELECT latest(structuralIntegrity) as integrity FROM SantaLocation",
  description: "Sleigh structural integrity",
  refreshInterval: 10000,
  visualizationType: 'gauge',
};

export const sleighNavigationQuery: NRQLQueryConfig = {
  query: "SELECT latest(navigationStatus) as status, latest(distanceToNextStop) as distance FROM SantaLocation",
  description: "Navigation status and distance to next stop",
  refreshInterval: 5000,
  visualizationType: 'json',
};

export const sleighMetricsQuery: NRQLQueryConfig = {
  query: "SELECT latest(heading) as heading, latest(structuralIntegrity) as structuralIntegrity, latest(navigationStatus) as navigationStatus, latest(magicFuelLevel) as magicFuelLevel FROM SantaLocation",
  description: "Complete sleigh metrics for dashboard",
  refreshInterval: 5000,
  visualizationType: 'json',
};

// ============================================================================
// REINDEER QUERIES
// ============================================================================

export const reindeerTeamAveragesQuery: NRQLQueryConfig = {
  query: "SELECT latest(averageEnergy) as avgEnergy, latest(averageHealth) as avgHealth, latest(averageMorale) as avgMorale FROM ReindeerTeamStatus SINCE 10 minutes ago",
  description: "Team average metrics",
  refreshInterval: 10000,
  visualizationType: 'billboard',
};

export const reindeerIndividualQuery: NRQLQueryConfig = {
  query: "SELECT latest(energy) as energy, latest(health) as health, latest(morale) as morale, latest(speedContribution) as speedContribution, latest(status) as status FROM ReindeerStatus FACET name SINCE 10 minutes ago",
  description: "Individual reindeer current status",
  refreshInterval: 10000,
  visualizationType: 'table',
};

export const reindeerEnergyTrendQuery: NRQLQueryConfig = {
  query: "SELECT average(energy) FROM ReindeerStatus FACET name SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Reindeer energy levels over time",
  refreshInterval: 15000,
  visualizationType: 'line',
};

export const reindeerHealthTrendQuery: NRQLQueryConfig = {
  query: "SELECT average(health) FROM ReindeerStatus FACET name SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Reindeer health over time",
  refreshInterval: 15000,
  visualizationType: 'line',
};

export const reindeerSpeedContributionQuery: NRQLQueryConfig = {
  query: "SELECT latest(speedContribution) AS speedContribution FROM ReindeerStatus FACET name SINCE 10 minutes ago",
  description: "Speed contribution by reindeer",
  refreshInterval: 10000,
  visualizationType: 'bar',
};

// ============================================================================
// DELIVERY QUERIES
// ============================================================================

export const deliveryTotalQuery: NRQLQueryConfig = {
  query: "SELECT latest(totalGiftsDelivered) as total FROM GiftDelivery",
  description: "Total gifts delivered",
  refreshInterval: 5000,
  visualizationType: 'billboard',
};

export const deliveryRateQuery: NRQLQueryConfig = {
  query: "SELECT rate(count(*), 1 minute) as rate FROM GiftDelivery SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Gift delivery rate over time",
  refreshInterval: 5000,
  visualizationType: 'line',
};

export const deliveryRegionalQuery: NRQLQueryConfig = {
  query: "SELECT count(*) as deliveries FROM GiftDelivery FACET currentRegion SINCE 10 minutes ago",
  description: "Deliveries by region",
  refreshInterval: 30000, // 30 seconds
  visualizationType: 'bar',
};

export const deliveryCountriesQuery: NRQLQueryConfig = {
  query: "SELECT uniqueCount(country) as countries FROM SantaLocation SINCE 10 minutes ago",
  description: "Number of countries visited",
  refreshInterval: 30000,
  visualizationType: 'billboard',
};

// ============================================================================
// WORKSHOP QUERIES
// ============================================================================

export const workshopProductionRateQuery: NRQLQueryConfig = {
  query: "SELECT average(productionRate) FROM WorkshopMetrics SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Toy production rate over time",
  refreshInterval: 10000,
  visualizationType: 'line',
};

export const workshopActiveElvesQuery: NRQLQueryConfig = {
  query: "SELECT latest(activeElves) as active FROM WorkshopMetrics",
  description: "Currently active elves",
  refreshInterval: 10000,
  visualizationType: 'billboard',
};

export const workshopQualityScoreQuery: NRQLQueryConfig = {
  query: "SELECT average(qualityScore) FROM WorkshopMetrics SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Quality score trend",
  refreshInterval: 15000,
  visualizationType: 'line',
};

export const workshopInventoryQuery: NRQLQueryConfig = {
  query: "SELECT latest(toyInventory) as toys, latest(wrappingPaperInventory) as wrappingPaper, latest(ribbonsInventory) as ribbons, latest(magicDustInventory) as magicDust FROM WorkshopMetrics",
  description: "Current inventory levels",
  refreshInterval: 30000,
  visualizationType: 'bar',
};

export const workshopDepartmentProductivityQuery: NRQLQueryConfig = {
  query: "SELECT average(productivity) FROM ElfProduction FACET department SINCE 10 minutes ago",
  description: "Productivity by department",
  refreshInterval: 15000,
  visualizationType: 'bar',
};

// ============================================================================
// WEATHER QUERIES
// ============================================================================

export const weatherCurrentQuery: NRQLQueryConfig = {
  query: "SELECT latest(temperature) as temp, latest(windSpeed) as wind, latest(visibility) as visibility, latest(precipitation) as precipitation FROM WeatherConditions",
  description: "Current weather conditions",
  refreshInterval: 30000,
  visualizationType: 'json',
};

export const weatherTemperatureTrendQuery: NRQLQueryConfig = {
  query: "SELECT average(temperature) FROM WeatherConditions SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Temperature trend",
  refreshInterval: 30000,
  visualizationType: 'line',
};

export const weatherVisibilityTrendQuery: NRQLQueryConfig = {
  query: "SELECT average(visibility) FROM WeatherConditions SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Visibility trend",
  refreshInterval: 30000,
  visualizationType: 'line',
};

export const weatherAlertsQuery: NRQLQueryConfig = {
  query: "SELECT count(*) FROM WeatherAlert FACET severity SINCE 10 minutes ago",
  description: "Weather alerts by severity",
  refreshInterval: 60000, // 1 minute
  visualizationType: 'bar',
};

// ============================================================================
// INCIDENT QUERIES
// ============================================================================

export const incidentsActiveQuery: NRQLQueryConfig = {
  query: "SELECT * FROM SantaIncident WHERE status != 'resolved' SINCE 10 minutes ago LIMIT 100",
  description: "Active incidents",
  refreshInterval: 15000,
  visualizationType: 'table',
};

export const incidentsBySeverityQuery: NRQLQueryConfig = {
  query: "SELECT count(*) FROM SantaIncident WHERE status != 'resolved' FACET severity",
  description: "Active incidents by severity",
  refreshInterval: 15000,
  visualizationType: 'bar',
};

export const incidentsByTypeQuery: NRQLQueryConfig = {
  query: "SELECT count(*) FROM SantaIncident FACET type SINCE 10 minutes ago",
  description: "Incidents by type",
  refreshInterval: 30000,
  visualizationType: 'bar',
};

export const incidentsTimelineQuery: NRQLQueryConfig = {
  query: "SELECT count(*) FROM SantaIncident SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Incident creation timeline",
  refreshInterval: 30000,
  visualizationType: 'line',
};

export const incidentResolutionTimeQuery: NRQLQueryConfig = {
  query: "SELECT average(duration) as avgResolutionTime FROM SantaIncident WHERE status = 'resolved' SINCE 10 minutes ago",
  description: "Average incident resolution time",
  refreshInterval: 30000,
  visualizationType: 'billboard',
};

// ============================================================================
// CUSTOM METRICS QUERIES (for metrics instrumentation)
// ============================================================================

export const sleighSpeedMetricQuery: NRQLQueryConfig = {
  query: "SELECT average(newrelic.timeslice.value) FROM Metric WHERE metricTimesliceName = 'Custom/Sleigh/Speed' SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Sleigh speed from custom metrics",
  refreshInterval: 5000,
  visualizationType: 'line',
};

export const reindeerEnergyMetricQuery: NRQLQueryConfig = {
  query: "SELECT average(newrelic.timeslice.value) FROM Metric WHERE metricTimesliceName LIKE 'Custom/Reindeer/%/Energy' FACET metricTimesliceName SINCE 10 minutes ago TIMESERIES AUTO",
  description: "Reindeer energy from custom metrics",
  refreshInterval: 10000,
  visualizationType: 'line',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all queries for a specific category
 */
export const getQueriesByCategory = (category: 'sleigh' | 'reindeer' | 'delivery' | 'workshop' | 'weather' | 'incidents') => {
  const queryMap = {
    sleigh: [sleighSpeedQuery, sleighAltitudeQuery, sleighFuelQuery, sleighIntegrityQuery, sleighNavigationQuery],
    reindeer: [reindeerTeamAveragesQuery, reindeerIndividualQuery, reindeerEnergyTrendQuery, reindeerHealthTrendQuery, reindeerSpeedContributionQuery],
    delivery: [deliveryTotalQuery, deliveryRateQuery, deliveryRegionalQuery, deliveryCountriesQuery],
    workshop: [workshopProductionRateQuery, workshopActiveElvesQuery, workshopQualityScoreQuery, workshopInventoryQuery, workshopDepartmentProductivityQuery],
    weather: [weatherCurrentQuery, weatherTemperatureTrendQuery, weatherVisibilityTrendQuery, weatherAlertsQuery],
    incidents: [incidentsActiveQuery, incidentsBySeverityQuery, incidentsByTypeQuery, incidentsTimelineQuery, incidentResolutionTimeQuery],
  };

  return queryMap[category];
};

/**
 * Create a custom query with default values
 */
export const createCustomQuery = (
  query: string,
  description: string,
  options?: Partial<Omit<NRQLQueryConfig, 'query' | 'description'>>
): NRQLQueryConfig => {
  return {
    query,
    description,
    refreshInterval: options?.refreshInterval ?? 30000,
    visualizationType: options?.visualizationType ?? 'json',
    accountId: options?.accountId,
  };
};

// ============================================================================
// ADDITIONAL QUERIES FOR DATA HOOKS
// ============================================================================

/**
 * Santa Position Query - for real-time map updates
 */
export const santaPositionQuery: NRQLQueryConfig = {
  query: "SELECT latest(latitude) as lat, latest(longitude) as lng, latest(altitude) as altitude, latest(speed) as speed, latest(heading) as heading, latest(nextStop) as nextStop, latest(distanceToNextStop) as distance, latest(magicFuelLevel) as fuel FROM SantaLocation",
  description: "Current Santa position with all details",
  refreshInterval: 2000, // 2 seconds for real-time map
  visualizationType: 'json',
};

/**
 * Sleigh Current Status - for dashboard displays
 */
export const sleighCurrentStatusQuery: NRQLQueryConfig = {
  query: "SELECT latest(heading) as heading, latest(structuralIntegrity) as integrity, latest(navigationStatus) as status FROM SantaLocation",
  description: "Current sleigh status",
  refreshInterval: 5000,
  visualizationType: 'json',
};

/**
 * Delivery Remaining Query
 */
export const deliveryRemainingQuery: NRQLQueryConfig = {
  query: "SELECT latest(totalGiftsRemaining) as remaining FROM GiftDelivery",
  description: "Remaining gifts to deliver",
  refreshInterval: 5000,
  visualizationType: 'billboard',
};

/**
 * Current Region Query
 */
export const deliveryCurrentRegionQuery: NRQLQueryConfig = {
  query: "SELECT latest(currentRegion) as region FROM SantaLocation",
  description: "Current delivery region",
  refreshInterval: 10000,
  visualizationType: 'json',
};

/**
 * Delivery Current Metrics Query - aggregates all delivery data
 */
export const deliveryCurrentMetricsQuery: NRQLQueryConfig = {
  query: "SELECT latest(totalGiftsDelivered) as totalGiftsDelivered, latest(totalGiftsRemaining) as totalGiftsRemaining, latest(currentRegion) as currentRegion FROM GiftDelivery",
  description: "Complete current delivery metrics",
  refreshInterval: 5000,
  visualizationType: 'json',
};

/**
 * Workshop Current Metrics Query - aggregates all workshop data
 */
export const workshopCurrentMetricsQuery: NRQLQueryConfig = {
  query: "SELECT latest(activeElves) as activeElves, latest(totalElves) as totalElves, latest(productionRate) as productionRate, latest(qualityScore) as qualityScore, latest(toyInventory) as toys, latest(wrappingPaperInventory) as wrappingPaper, latest(ribbonsInventory) as ribbons, latest(magicDustInventory) as magicDust, latest(currentShift) as currentShift, latest(shiftRotationIn) as shiftRotationIn FROM WorkshopMetrics",
  description: "Complete current workshop metrics",
  refreshInterval: 5000,
  visualizationType: 'json',
};
