// New Relic must be first import
import newrelic from 'newrelic';
import express from 'express';
import cors from 'cors';
import { createLogger } from './logger';
import { DeliverySimulator } from './simulator';
import { metricsRouter } from './routes/metrics';
import { healthRouter } from './routes/health';

const app = express();
const port = process.env.PORT || 3004;
const logger = createLogger('delivery-service');

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      service: 'delivery-service'
    });
  });
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);

// Initialize delivery simulator
const simulator = DeliverySimulator.getInstance();

// Start simulation loop
simulator.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  simulator.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  simulator.stop();
  process.exit(0);
});

app.listen(port, () => {
  logger.info(`Delivery service started on port ${port}`);

  // Record custom event for service startup
  newrelic.recordCustomEvent('ServiceStartup', {
    service: 'delivery-service',
    port,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
