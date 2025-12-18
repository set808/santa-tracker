// Must be first import to initialize New Relic agent
import 'newrelic';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import logger from './logger';
import healthRoutes from './routes/health';
import queryRoutes from './routes/query';

const app = express();
const PORT = process.env.PORT || 3007;

// Middleware: CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware: JSON body parser
app.use(express.json({ limit: '10mb' }));

// Middleware: Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });

  next();
});

// Middleware: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent')
    });
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      timestamp: new Date().toISOString()
    });
  }
});

// Apply rate limiting to all routes
app.use(limiter);

// Routes
app.use('/', healthRoutes);
app.use('/', queryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path
  });
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`NerdGraph Proxy server started`, {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*'
  });

  // Verify required environment variables
  if (!process.env.NEW_RELIC_API_KEY) {
    logger.error('NEW_RELIC_API_KEY environment variable is not set');
  }
  if (!process.env.NEW_RELIC_ACCOUNT_ID) {
    logger.error('NEW_RELIC_ACCOUNT_ID environment variable is not set');
  }
  if (!process.env.NEW_RELIC_LICENSE_KEY) {
    logger.warn('NEW_RELIC_LICENSE_KEY environment variable is not set - monitoring may not work');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
