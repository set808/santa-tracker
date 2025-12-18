import { Router } from 'express';
import newrelic from 'newrelic';

export const healthRouter = Router();

// Health check endpoint (for synthetics monitoring)
healthRouter.get('/', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    service: 'sleigh-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };

  newrelic.addCustomAttributes({
    endpoint: 'health-check',
    uptime: healthStatus.uptime
  });

  res.json(healthStatus);
});

// Readiness check
healthRouter.get('/ready', (req, res) => {
  // Check if service is ready to accept requests
  const isReady = true; // Add actual readiness checks here

  if (isReady) {
    res.json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

// Liveness check
healthRouter.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});
