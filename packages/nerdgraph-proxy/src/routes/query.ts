import { Request, Response, Router } from 'express';
import NerdGraphClient from '../nerdgraph-client';
import logger from '../logger';

const router = Router();
const nerdGraphClient = new NerdGraphClient();

interface QueryRequest {
  nrql: string;
  accountId?: string;
}

interface QueryResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

/**
 * POST /query
 * Execute a NRQL query via NerdGraph
 */
router.post('/query', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { nrql, accountId } = req.body as QueryRequest;

    // Validate input
    if (!nrql || typeof nrql !== 'string') {
      logger.warn('Invalid query request: missing or invalid nrql', {
        body: req.body
      });
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid "nrql" parameter',
        timestamp: new Date().toISOString()
      } as QueryResponse);
    }

    // Validate nrql length
    if (nrql.length === 0 || nrql.length > 4000) {
      logger.warn('Invalid query request: nrql length out of bounds', {
        length: nrql.length
      });
      return res.status(400).json({
        success: false,
        error: 'NRQL query must be between 1 and 4000 characters',
        timestamp: new Date().toISOString()
      } as QueryResponse);
    }

    // Validate accountId if provided
    if (accountId !== undefined) {
      if (typeof accountId !== 'string' && typeof accountId !== 'number') {
        logger.warn('Invalid query request: invalid accountId type', {
          accountId,
          type: typeof accountId
        });
        return res.status(400).json({
          success: false,
          error: 'Invalid "accountId" parameter',
          timestamp: new Date().toISOString()
        } as QueryResponse);
      }
    }

    // Log the query request
    logger.info('Processing NerdGraph query request', {
      nrql: nrql.substring(0, 100),
      accountId: accountId || 'default',
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Execute the query
    const results = await nerdGraphClient.query(nrql, accountId?.toString());

    const duration = Date.now() - startTime;

    // Log successful query to New Relic
    logger.info('NerdGraph query completed successfully', {
      duration,
      resultCount: Array.isArray(results) ? results.length : 0,
      nrql: nrql.substring(0, 100)
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    } as QueryResponse);
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error('NerdGraph query failed', {
      error: errorMessage,
      duration,
      nrql: req.body.nrql?.substring(0, 100),
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    } as QueryResponse);
  }
});

export default router;
