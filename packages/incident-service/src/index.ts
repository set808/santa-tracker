import newrelic from 'newrelic';
import express from 'express';
import cors from 'cors';
import { createLogger } from './logger';
import { IncidentGenerator } from './incident-generator';
import { metricsRouter } from './routes/metrics';
import { healthRouter } from './routes/health';

const app = express();
const port = process.env.PORT || 3006;
const logger = createLogger('incident-service');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration
    });
  });
  next();
});

app.use('/health', healthRouter);
app.use('/incidents', metricsRouter);

const generator = IncidentGenerator.getInstance();
generator.start();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  generator.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  generator.stop();
  process.exit(0);
});

app.listen(port, () => {
  logger.info(`Incident service started on port ${port}`);
  newrelic.recordCustomEvent('ServiceStartup', {
    service: 'incident-service',
    port,
    timestamp: new Date().toISOString()
  });
});
