# Workshop Service

Santa's Workshop Management Service with New Relic APM monitoring.

## Overview

This service simulates Santa's workshop operations, tracking 500 elves across 4 departments with realistic production patterns, shift rotations, and inventory management.

## Features

### Departments (500 Total Elves)
- **Manufacturing** (200 elves) - Primary toy production
- **Quality Control** (100 elves) - Ensures toy quality
- **Wrapping** (125 elves) - Gift wrapping operations
- **Logistics** (75 elves) - Shipping and coordination

### Metrics Tracked
- **Production Rate**: 5,000-15,000 toys/minute (varies by productivity and morale)
- **Quality Score**: 92-99% (based on department performance)
- **Inventory Levels**:
  - Toys: 1M-5M units
  - Wrapping Paper: 500K-2M rolls
  - Ribbons: 300K-1M spools
  - Magic Dust: 10K-50K ounces

### Shift System
- **3 Shifts**: Morning, Evening, Night (8 hours each)
- Automatic rotation with morale and productivity resets
- Night shift operates at 70% capacity
- Productivity decreases up to 15% during shift due to fatigue

### Department Dynamics
- **Productivity**: 85-99% (varies with fatigue and morale)
- **Morale**: 70-95% (fluctuates throughout shift)
- **Defect Rate**: 0.2-5% (inversely related to productivity and morale)
- **Active Elves**: 85-100% of department (accounts for breaks, meetings)

### New Relic Events
- **WorkshopMetrics** - Overall workshop performance (every 4 seconds)
- **ElfProduction** - Per-department production data (every 4 seconds)
- **ShiftRotation** - Shift change events
- **MaterialsReplenished** - Inventory replenishment events

## Configuration

- **Port**: 3003 (configurable via PORT env var)
- **New Relic App Name**: Santa-Workshop-Service
- **Update Interval**: 4 seconds

## API Endpoints

### Health Endpoints
- `GET /health` - Service health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

### Metrics Endpoints
- `GET /metrics/current` - Current workshop metrics
- `GET /metrics/elves` - Elf statistics by department
- `GET /metrics/departments` - All department metrics
- `GET /metrics/department/:name` - Specific department metrics
- `GET /metrics/inventory` - Current inventory levels
- `GET /metrics/production` - Production rates and statistics

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

## Docker

```bash
# Build image
docker build -t workshop-service .

# Run container
docker run -p 3003:3003 \
  -e NEW_RELIC_LICENSE_KEY=your_key \
  -e NEW_RELIC_APP_NAME=Santa-Workshop-Service \
  workshop-service
```

## Environment Variables

- `PORT` - Server port (default: 3003)
- `NEW_RELIC_LICENSE_KEY` - New Relic license key (required)
- `NEW_RELIC_APP_NAME` - Application name in New Relic (default: Santa-Workshop-Service)
- `LOG_LEVEL` - Logging level (default: info)
- `NODE_ENV` - Environment (development/production)
