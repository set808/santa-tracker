import { Router } from 'express';
import newrelic from 'newrelic';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const healthStatus = {
    status: 'healthy',
    service: 'incident-service',
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

healthRouter.get('/ready', (req, res) => {
  res.json({ status: 'ready' });
});

healthRouter.get('/live', (req, res) => {
  res.json({ status: 'alive' });
});
