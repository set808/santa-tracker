import { Request, Response, Router } from 'express';
import logger from '../logger';

const router = Router();

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

/**
 * Basic health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'nerdgraph-proxy',
    version: process.env.npm_package_version || '1.0.0'
  };

  res.json(health);
});

/**
 * Readiness check endpoint
 */
router.get('/ready', (req: Request, res: Response) => {
  // Check if required environment variables are set
  const isReady =
    !!process.env.NEW_RELIC_API_KEY &&
    !!process.env.NEW_RELIC_ACCOUNT_ID;

  if (isReady) {
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } else {
    logger.error('Service is not ready: missing required environment variables');
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Missing required environment variables'
    });
  }
});

/**
 * Liveness check endpoint
 */
router.get('/live', (req: Request, res: Response) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export default router;
