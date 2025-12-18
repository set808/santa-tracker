// Load environment variables first
// New Relic must be second import (after dotenv)
import newrelic from 'newrelic';
import express from 'express';
import cors from 'cors';
import { createLogger } from './logger';
import { SleighSimulator } from './simulator';
import { metricsRouter } from './routes/metrics';
import { healthRouter } from './routes/health';

const app = express();
const port = process.env.PORT || 3001;
const logger = createLogger('sleigh-service');

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
      service: 'sleigh-service'
    });
  });
  next();
});

// Routes
app.use('/health', healthRouter);
app.use('/metrics', metricsRouter);

// Initialize sleigh simulator
const simulator = SleighSimulator.getInstance();

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
  logger.info(`Sleigh service started on port ${port}`);

  // Record custom event for service startup
  newrelic.recordCustomEvent('ServiceStartup', {
    service: 'sleigh-service',
    port,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
