# NerdGraph Proxy Service

A secure proxy service that allows the frontend to query New Relic without exposing API keys.

## Overview

This service acts as a secure intermediary between the Santa Tracker frontend and New Relic's NerdGraph API. It provides:

- **Security**: API keys are kept server-side and never exposed to the client
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Validation**: Only SELECT queries are allowed, blocking any mutations
- **Logging**: All queries are logged to New Relic for monitoring
- **Error Handling**: Robust retry logic and error handling

## Prerequisites

- Node.js 20+
- New Relic account with:
  - License Key (for agent monitoring)
  - API Key (for NerdGraph queries)
  - Account ID

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3007
NEW_RELIC_LICENSE_KEY=your_license_key
NEW_RELIC_API_KEY=your_api_key
NEW_RELIC_ACCOUNT_ID=your_account_id
CORS_ORIGIN=*
LOG_LEVEL=info
```

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t nerdgraph-proxy .
docker run -p 3007:3007 --env-file .env nerdgraph-proxy
```

## API Endpoints

### POST /query

Execute a NRQL query.

**Request:**
```json
{
  "nrql": "SELECT count(*) FROM Transaction SINCE 1 hour ago",
  "accountId": "optional-account-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "count": 1234
    }
  ],
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### GET /health

Basic health check.

### GET /ready

Readiness check - verifies environment variables are set.

### GET /live

Liveness check.

## Security Features

1. **NRQL Validation**: Only SELECT queries are allowed
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **Query Length Limits**: Maximum 4000 characters
4. **No Dangerous Keywords**: Blocks DROP, DELETE, UPDATE, etc.
5. **API Key Protection**: Keys never exposed to clients

## Monitoring

The service is instrumented with New Relic and logs all:
- Query requests and responses
- Errors and failures
- Rate limit violations
- HTTP request metrics

## Error Handling

The service includes:
- Automatic retry logic (3 attempts with exponential backoff)
- Detailed error logging
- Graceful error responses
- Request timeout protection (30 seconds)
