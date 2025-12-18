# NRQL Query Test Results

This document contains test results for all NRQL queries in the Santa Tracker frontend, documenting actual response formats from New Relic.

## Test Date: 2025-12-18

## Workshop Metrics

### ✅ WorkshopMetrics Event Structure
**Query**: `SELECT * FROM WorkshopMetrics LIMIT 1`

**Available Fields**:
- `activeElves`: number
- `totalElves`: number
- `productionRate`: number
- `qualityScore`: number
- `currentShift`: string ('morning' | 'evening' | 'night')
- `shiftRotationIn`: number (minutes)
- `toyInventory`: number ⚠️ **NOT** `inventory.toys`
- `wrappingPaperInventory`: number ⚠️ **NOT** `inventory.wrappingPaper`
- `ribbonsInventory`: number ⚠️ **NOT** `inventory.ribbons`
- `magicDustInventory`: number ⚠️ **NOT** `inventory.magicDust`
- `timestamp`: number

### ❌ workshopInventoryQuery (Line 145)
**Current Query**: `SELECT latest(inventory.toys) as toys...`
**Issue**: Field `inventory.toys` doesn't exist
**Fix**: Change to `latest(toyInventory) as toys`

### ✅ Fixed Inventory Query
**Query**: `SELECT latest(toyInventory) as toys, latest(wrappingPaperInventory) as wrappingPaper FROM WorkshopMetrics`
**Result**:
```json
{
  "toys": 3201756.33,
  "wrappingPaper": 1999990.99
}
```
**Status**: Works correctly ✅

## Reindeer Metrics

### ✅ ReindeerTeamStatus Event Structure
**Query**: `SELECT * FROM ReindeerTeamStatus LIMIT 1`

**Available Fields**:
- `averageEnergy`: number ✅ Correct field name
- `averageHealth`: number ✅ Correct field name
- `averageMorale`: number ✅ Correct field name
- `averageSpeedContribution`: number
- `totalReindeer`: number
- `mode`: string
- `timestamp`: number

### ❌ reindeerTeamAveragesQuery (Line 53)
**Current Query**: `SELECT average(energy) FROM ReindeerStatus`
**Issue**: Calculates averages from individual reindeer instead of using pre-calculated team data
**Fix**: Change to `SELECT latest(averageEnergy) FROM ReindeerTeamStatus`

## Sleigh Metrics

### ✅ SantaLocation Event Structure
**Query**: `SELECT * FROM SantaLocation LIMIT 1`

**Available Fields**:
- `speed`: number ✅
- `altitude`: number ✅
- `heading`: number ✅
- `magicFuelLevel`: number ✅
- `structuralIntegrity`: number ✅
- `navigationStatus`: string ✅
- `latitude`: number ✅
- `longitude`: number ✅
- `distanceToNextStop`: number ✅
- `nextStop`: string ✅
- `percentComplete`: number
- `stopIndex`: number
- `totalStops`: number
- `mode`: string
- `timestamp`: number

**Status**: All sleigh queries appear to use correct field names ✅

## Summary of Required Fixes

| Query | Line | Issue | Fix |
|-------|------|-------|-----|
| `workshopInventoryQuery` | 145 | Uses `inventory.toys` | Change to `toyInventory` |
| `reindeerTeamAveragesQuery` | 53 | Uses `average(energy) FROM ReindeerStatus` | Change to `latest(averageEnergy) FROM ReindeerTeamStatus` |

## Response Format Patterns

### TIMESERIES Queries
Return array of objects with:
- `beginTimeSeconds`: Unix timestamp
- `endTimeSeconds`: Unix timestamp
- `average.fieldName` or `count` etc.

### latest() Queries
Return array with single object containing:
- `latest.fieldName` OR just `fieldName` (depends on AS alias)

### FACET Queries
Return array of objects with:
- `facet`: string (the facet value)
- Other aggregated fields
