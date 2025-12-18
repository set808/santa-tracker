/**
 * Data transformation utilities for converting backend data formats
 * to frontend-expected structures (shared-types interfaces)
 */

/**
 * Transform inventory query results from NRQL to nested structure
 * Used when fetching inventory data directly from New Relic
 */
export function transformInventoryData(data: any): {
  toys: number;
  wrappingPaper: number;
  ribbons: number;
  magicDust: number;
} | null {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  const latest = data[0];

  return {
    toys: latest.toys || 0,
    wrappingPaper: latest.wrappingPaper || 0,
    ribbons: latest.ribbons || 0,
    magicDust: latest.magicDust || 0,
  };
}
