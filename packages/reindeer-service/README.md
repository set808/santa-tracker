# Reindeer Service

Santa's Reindeer Tracking Service with comprehensive New Relic APM instrumentation.

## Overview

The Reindeer Service monitors all 9 of Santa's reindeer, tracking their energy, health, morale, and speed contribution. The service continuously sends custom events and metrics to New Relic for real-time monitoring and analysis.

## Reindeer Team

- **Dasher** - Lead position
- **Dancer** - Lead position
- **Prancer** - Middle position
- **Vixen** - Middle position
- **Comet** - Middle position
- **Cupid** - Middle position
- **Donner** - Rear position
- **Blitzen** - Rear position
- **Rudolph** - Lead position (with special nose brightness ability)

## Metrics Tracked

For each reindeer:
- **Energy**: 50-100% (depletes during Christmas Eve, recovers during route planning)
- **Health**: 70-100% (varies with exertion)
- **Morale**: 60-100% (affected by conditions and progress)
- **Speed Contribution**: 80-100% (affected by fatigue)
- **Status**: excellent | good | tired | exhausted | resting
- **Special Ability**: Rudolph's nose brightness (80-100%)

## New Relic Instrumentation

### Custom Events
- **ReindeerStatus**: Individual reindeer metrics sent every 3 seconds
- **ReindeerTeamStatus**: Team-wide averages
- **ServiceStartup**: Service initialization event

### Custom Metrics
- `Custom/Reindeer/{Name}/Energy`
- `Custom/Reindeer/{Name}/Health`
- `Custom/Reindeer/{Name}/Morale`
- `Custom/Reindeer/{Name}/SpeedContribution`
- `Custom/Reindeer/Rudolph/NoseBrightness`
- `Custom/Reindeer/Team/AverageEnergy`
- `Custom/Reindeer/Team/AverageHealth`
- `Custom/Reindeer/Team/AverageMorale`
- `Custom/Reindeer/Team/AverageSpeedContribution`

## API Endpoints

### Health Checks
- `GET /health` - Service health status
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Metrics
- `GET /metrics/all` - Get all reindeer statuses
- `GET /metrics/:name` - Get specific reindeer status (e.g., /metrics/Rudolph)
- `GET /metrics/team/average` - Get team-wide averages

## Running the Service

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Docker
```bash
docker build -t reindeer-service .
docker run -p 3002:3002 -e NEW_RELIC_LICENSE_KEY=your_key reindeer-service
```

## Environment Variables

- `NEW_RELIC_LICENSE_KEY` - Your New Relic license key (required)
- `NEW_RELIC_APP_NAME` - Application name (default: Santa-Reindeer-Service)
- `PORT` - Service port (default: 3002)
- `LOG_LEVEL` - Logging level (default: info)
- `NODE_ENV` - Environment (development | production)

## Behavior Modes

### Route Planning Mode
When NOT Christmas Eve:
- Reindeer are resting at the North Pole
- Energy and health slowly recover
- Morale stays high
- Speed contribution remains optimal
- Updates every 3 seconds

### Christmas Eve Mode
On December 24-25:
- Reindeer are actively pulling the sleigh
- Energy depletes over time (rear position reindeer work harder)
- Health degrades slightly with exertion
- Morale fluctuates based on progress
- Speed contribution decreases with fatigue
- Rudolph's nose brightness may dim when tired
- Updates every 3 seconds

## Integration with Other Services

This service works alongside:
- **Sleigh Service** (port 3001) - Tracks sleigh location and systems
- **Workshop Service** - Monitors toy production
- **Weather Service** - Provides conditions data

## Logging

All logs are formatted with the Winston New Relic formatter and automatically forwarded to New Relic Logs. Each log entry includes:
- Service name
- Log level
- Timestamp
- New Relic trace correlation

## Monitoring Recommendations

### Dashboards
Create dashboards to visualize:
- Individual reindeer energy levels over time
- Team average metrics
- Rudolph's nose brightness
- Reindeer status distribution

### Alerts
Configure alerts for:
- Average team energy below 30%
- Individual reindeer in "exhausted" status
- Rudolph's nose brightness below 75%
- Service health check failures

### NRQL Queries
```sql
-- Average team energy
SELECT average(averageEnergy) FROM ReindeerTeamStatus TIMESERIES

-- Individual reindeer tracking
SELECT latest(energy), latest(health), latest(morale)
FROM ReindeerStatus
WHERE name = 'Rudolph'
TIMESERIES

-- Reindeer status distribution
SELECT count(*) FROM ReindeerStatus
FACET status
TIMESERIES
```
