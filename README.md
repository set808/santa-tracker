# 🎅 Santa Tracker with New Relic Observability

> **Help Santa prepare for Christmas Eve! This real-time simulation runs Santa through a full practice delivery run, using New Relic's observability platform to monitor performance, track incidents, and optimize the big night.**

**Narrative:** Santa is testing his Christmas Eve operations at 144x speed (24 hours compressed into 10 minutes). Watch the complete simulation in 12 minutes to see the full global journey, identify issues, and optimize routes for the real Christmas Eve.

This project showcases the full New Relic observability platform by monitoring Santa's sleigh, reindeer team, North Pole workshop, and global gift delivery operations in real-time.

[![New Relic](https://img.shields.io/badge/New%20Relic-Observability-1CE783)](https://newrelic.com)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)

## 🎁 What You'll See in 12 Minutes

**Complete Christmas Eve Simulation:**
- **0-10 minutes**: Full 24-hour practice run (all operations, all regions)
- **10-12 minutes**: Completion buffer and wrap-up metrics

### Key Milestones:

- **5 Billion Gifts Delivered**: Watch the counter climb from 0 to 5B over the journey (100% of world population!)
- **All 7 Continents Visited**: Complete global distribution progression
  - **Minutes 0-3**: Asia-Pacific, Asia, Middle East
  - **Minutes 3-7**: Africa, Europe, South America
  - **Minutes 7-10**: North America (final deliveries)
  - **Minutes 10-12**: Journey complete, final metrics visible
- **Live Incidents**: Weather alerts, equipment issues, navigation problems throughout
- **Reindeer Journey**: Watch energy deplete from 100% → 40-60% over the full run
- **Sleigh Performance**: Real-time tracking of speed, altitude, fuel consumption across continents
- **New Relic Integration**: APM, logs, custom events, distributed tracing, NRQL queries

**Why 12 Minutes?**
- 10 minutes = 24 simulated hours (one complete Christmas Eve)
- 12 minutes provides 2-minute buffer to observe completion metrics and final state
- Ensures all 7 regions get substantial delivery coverage

## 🎄 Features

### Real-Time Tracking
- **Interactive Map** - Follow Santa's sleigh across the globe with real-time position updates (Leaflet + OpenStreetMap)
- **Live Metrics Dashboard** - Speed, altitude, fuel levels, and navigation status
- **Reindeer Performance** - Individual health, energy, and morale tracking for all 9 reindeer
- **Workshop Operations** - Elf productivity, toy production rates, and inventory management
- **Weather Monitoring** - Current conditions affecting Santa's flight path
- **Incident Management** - Real-time alerts for chimney obstructions, airspace conflicts, and more

### New Relic Platform Integration
- **APM (Application Performance Monitoring)** - 8 Node.js microservices with distributed tracing
- **Logs** - Structured JSON logs with context from all services
- **Custom Events** - Comprehensive telemetry for all Santa operations
- **NerdGraph API** - Query historical data and metrics from New Relic

### Educational Content
- **Tooltips** - Explain New Relic features on every metric
- **Real-World Analogies** - Maps Santa problems to actual production issues
- **NRQL Queries** - View and learn from actual queries powering the dashboards
- **Documentation Links** - Direct links to New Relic docs for deeper learning

## 🏗️ Architecture

### Microservices Backend (Node.js + Express + New Relic APM)

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
            ┌────────────┴───────────┬────────────────┐
            │                        │                │
    ┌───────▼────────┐      ┌───────▼────────┐  ┌───▼────────┐
    │   WebSocket    │      │   NerdGraph    │  │  Leaflet   │
    │    Gateway     │      │     Proxy      │  │    Map     │
    │   (Port 3008)  │      │   (Port 3007)  │  │  (OSM/Web) │
    └───────┬────────┘      └────────────────┘  └────────────┘
            │
    ┌───────┴──────────────────────────────────────────┐
    │              Microservices Mesh                   │
    ├───────────┬───────────┬──────────┬───────────────┤
    │  Sleigh   │ Reindeer  │ Workshop │   Delivery    │
    │  :3001    │  :3002    │  :3003   │    :3004      │
    ├───────────┼───────────┼──────────┼───────────────┤
    │  Weather  │ Incident  │          │               │
    │  :3005    │  :3006    │          │               │
    └───────────┴───────────┴──────────┴───────────────┘
                         │
                         │ All instrumented with
                         ▼ New Relic APM
              ┌──────────────────────┐
              │   New Relic One      │
              │   Platform           │
              └──────────────────────┘
```

### Data Flow

1. **Simulation Engines** continuously generate realistic Santa operations data
2. **Microservices** send custom events and metrics to New Relic
3. **WebSocket Gateway** aggregates data and broadcasts to connected clients
4. **Frontend** displays real-time data and queries NerdGraph for historical analytics
5. **NerdGraph Proxy** securely proxies NRQL queries to New Relic Insights API

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose (for containerized deployment)
- New Relic account (free tier available at [newrelic.com](https://newrelic.com))

### 1. Clone and Install

```bash
git clone <repository-url>
cd santa-tracker
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your New Relic credentials:

```env
# Required: New Relic APM Configuration
NEW_RELIC_LICENSE_KEY=your_license_key_here
NEW_RELIC_ACCOUNT_ID=your_account_id
NEW_RELIC_API_KEY=your_nerdgraph_api_key

# Optional: Region Configuration (US or EU)
NEW_RELIC_REGION=US
```

**Getting your New Relic credentials:**
1. Log into [New Relic One](https://one.newrelic.com/)
2. Go to your user menu (bottom left) → **API Keys**
3. Create an **INGEST - LICENSE** key (for `NEW_RELIC_LICENSE_KEY`)
4. Create a **USER** key with NerdGraph access (for `NEW_RELIC_API_KEY`)
5. Your **Account ID** is in the URL or Account Settings

**EU Region Users:** Set `NEW_RELIC_REGION=EU` if your account is in the EU data center

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up --build
```

This starts all microservices and the frontend. Access the app at [http://localhost:5173](http://localhost:5173)

### 4. Or Run Locally

```bash
# Build shared types
cd packages/shared-types && npm install && npm run build && cd ../..

# Start all services
npm run dev
```

## 📊 Creating Dashboards

Once the application is running and sending data to New Relic, you can create custom dashboards to visualize the telemetry data.

**Example NRQL Queries:**

```sql
-- Santa's Current Speed
SELECT latest(speed) FROM SantaLocation

-- Reindeer Team Health
SELECT average(health) FROM ReindeerStatus FACET name

-- Gift Delivery Rate
SELECT rate(count(*), 1 minute) FROM GiftDelivery

-- Active Incidents
SELECT count(*) FROM SantaIncident WHERE status = 'active' FACET type
```

To create a dashboard:
1. Go to [New Relic One](https://one.newrelic.com/) → **Dashboards**
2. Click **Create a dashboard**
3. Add charts using the NRQL queries above
4. Customize visualizations (line charts, billboards, tables, etc.)

## 🎨 Christmas Eve vs Route Planning Mode

The application operates in two modes:

### Route Planning Mode (Default)
Active when it's NOT December 24-25. Features:
- Simulates route optimization algorithms
- Shows efficiency scoring and analysis
- Slower update rates (planning vs real-time)
- All systems at optimal performance

### Christmas Eve Mode (Dec 24-25)
Activates automatically on Christmas Eve:
- Real-time delivery tracking following actual time zones
- Faster update rates (1-2 second intervals)
- Progressive performance degradation (fatigue, fuel depletion)
- Active incident generation (weather, chimneys, airspace)
- Regional delivery statistics updated live

## 📁 Project Structure

```
santa-tracker/
├── packages/
│   ├── shared-types/           # TypeScript types shared across services
│   ├── sleigh-service/         # Santa's sleigh tracking (APM)
│   ├── reindeer-service/       # Reindeer team monitoring (APM)
│   ├── workshop-service/       # North Pole operations (APM)
│   ├── delivery-service/       # Gift delivery tracking (APM)
│   ├── weather-service/        # Weather conditions (APM)
│   ├── incident-service/       # Incident management (APM)
│   ├── nerdgraph-proxy/        # Secure NerdGraph API proxy (APM)
│   └── frontend/               # React app
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom React hooks
│       │   ├── lib/            # Utilities and helpers
│       │   ├── store/          # Zustand state management
│       │   └── types/          # TypeScript definitions
│       └── public/             # Static assets
├── docker-compose.yml          # Container orchestration
├── .env.example                # Environment template
└── README.md                   # This file
```

## 🎯 Learning Objectives

This project demonstrates:

1. **Distributed Tracing** - Follow requests across 8 microservices
2. **Custom Events** - Create and query domain-specific telemetry
3. **Custom Metrics** - Track business KPIs in real-time
4. **Log Correlation** - Connect logs to transactions and traces
5. **NRQL Mastery** - Query and analyze telemetry data
6. **Real-Time Data Streaming** - WebSocket-based live updates
7. **Microservices Architecture** - Service mesh with distributed monitoring

## 🎁 Santa Problem → Real-World Mapping

| Santa Challenge | Observability Concept | Real-World Equivalent |
|----------------|----------------------|----------------------|
| Sleigh GPS failure | Service downtime detection | API endpoint outage |
| Reindeer fatigue | Resource exhaustion | CPU/Memory pressure |
| Chimney blockage | API timeout | Slow database query |
| Weather delays | Network latency | Cloud region issues |
| Gift inventory mismatch | Data inconsistency | Cache invalidation problem |
| Airspace conflicts | Rate limiting | Throttling from external service |
| Magic fuel depletion | Memory leak detection | Resource leak |
| Navigation errors | Service discovery failure | DNS/load balancer issues |

## 🔧 Configuration

### Service Ports

- Frontend: `5173`
- Sleigh Service: `3001`
- Reindeer Service: `3002`
- Workshop Service: `3003`
- Delivery Service: `3004`
- Weather Service: `3005`
- Incident Service: `3006`
- NerdGraph Proxy: `3007`
- WebSocket Gateway: `3008`

### Environment Variables

See `.env.example` for complete list. Key variables:

**Required:**
- `NEW_RELIC_LICENSE_KEY` - Your New Relic license key
- `NEW_RELIC_ACCOUNT_ID` - Your account ID
- `NEW_RELIC_API_KEY` - NerdGraph API key for queries

**Optional:**
- `NEW_RELIC_REGION` - Set to `EU` for EU data center (defaults to `US`)
- `VITE_NERDGRAPH_PROXY_URL` - NerdGraph proxy URL (defaults to `http://localhost:3007`)
- `VITE_WEBSOCKET_URL` - WebSocket gateway URL (defaults to `ws://localhost:3008/ws`)

## 📖 Additional Resources

- [New Relic Documentation](https://docs.newrelic.com) - Official New Relic docs
- [NRQL Query Language](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/) - Learn to query your data
- [APM Documentation](https://docs.newrelic.com/docs/apm/) - Application Performance Monitoring guide

## 🐛 Troubleshooting

### Services not connecting to New Relic
- Verify `NEW_RELIC_LICENSE_KEY` is set correctly in `.env`
- Check service logs for connection errors: `docker-compose logs [service-name]`
- Ensure license key matches your account
- For EU accounts, verify `NEW_RELIC_REGION=EU` is set

### Frontend not displaying data
- Check WebSocket connection status in browser console (F12)
- Verify all backend services are running: `docker-compose ps`
- Check NerdGraph proxy is accessible at `http://localhost:3007/health`
- Check WebSocket gateway at `http://localhost:3008/health`

### Map not loading
- Check internet connection (map tiles load from OpenStreetMap)
- Verify Leaflet CSS is loading in browser dev tools
- Check browser console for errors

### Environment variable issues
- Ensure you copied `.env.example` to `.env`
- Verify all three required variables are set (LICENSE_KEY, ACCOUNT_ID, API_KEY)
- Restart services after changing `.env`: `docker-compose down && docker-compose up --build`

## 🤝 Contributing

This is an educational demonstration project. Feel free to:
- Add new microservices or metrics
- Enhance the frontend visualizations
- Create additional dashboard templates
- Improve documentation

## 📜 License

MIT License - Feel free to use this project for learning and demonstration purposes.

## 🎅 Credits

Built with ❤️ for the New Relic community to demonstrate real-world observability concepts in a fun, engaging way.

**Technologies Used:**
- [New Relic](https://newrelic.com) - Full-stack observability platform
- [React](https://react.dev) - Frontend framework
- [Vite](https://vitejs.dev) - Build tool
- [Node.js](https://nodejs.org) - Backend runtime
- [Express](https://expressjs.com) - Web framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Leaflet](https://leafletjs.com) - Interactive mapping
- [OpenStreetMap](https://www.openstreetmap.org) - Map tiles
- [Docker](https://www.docker.com) - Containerization
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [Recharts](https://recharts.org) - Data visualization

---

**Happy Holidays! 🎄 May your applications be merry, bright, and fully observable!**
