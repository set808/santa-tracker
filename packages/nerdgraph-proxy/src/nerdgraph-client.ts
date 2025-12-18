import axios, { AxiosInstance } from 'axios';
import logger from './logger';

export interface NerdGraphQueryOptions {
  nrql: string;
  accountId?: string;
}

export interface NerdGraphResponse {
  data?: {
    actor?: {
      account?: {
        nrql?: {
          results?: any[];
        };
      };
    };
  };
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export class NerdGraphClient {
  private client: AxiosInstance;
  private apiKey: string;
  private defaultAccountId: string;

  constructor() {
    this.apiKey = process.env.NEW_RELIC_API_KEY || '';
    this.defaultAccountId = process.env.NEW_RELIC_ACCOUNT_ID || '';

    if (!this.apiKey) {
      throw new Error('NEW_RELIC_API_KEY environment variable is required');
    }

    if (!this.defaultAccountId) {
      throw new Error('NEW_RELIC_ACCOUNT_ID environment variable is required');
    }

    // Determine New Relic region endpoint
    const NERDGRAPH_ENDPOINTS = {
      US: 'https://api.newrelic.com/graphql',
      EU: 'https://api.eu.newrelic.com/graphql'
    };

    const region = (process.env.NEW_RELIC_REGION || 'US').toUpperCase();
    const endpoint = NERDGRAPH_ENDPOINTS[region as keyof typeof NERDGRAPH_ENDPOINTS] || NERDGRAPH_ENDPOINTS.US;

    logger.info(`Initializing NerdGraph client for ${region} region: ${endpoint}`);

    this.client = axios.create({
      baseURL: endpoint,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'API-Key': this.apiKey
      }
    });
  }

  /**
   * Validates NRQL query for safety
   * Only allows SELECT queries, no mutations or dangerous operations
   */
  private validateNRQL(nrql: string): void {
    const trimmedQuery = nrql.trim().toLowerCase();

    // Check if query starts with SELECT
    if (!trimmedQuery.startsWith('select')) {
      throw new Error('Only SELECT queries are allowed');
    }

    // Block dangerous keywords
    const dangerousKeywords = [
      'drop',
      'delete',
      'update',
      'insert',
      'create',
      'alter',
      'truncate',
      'exec',
      'execute'
    ];

    for (const keyword of dangerousKeywords) {
      if (trimmedQuery.includes(keyword)) {
        throw new Error(`Query contains disallowed keyword: ${keyword}`);
      }
    }

    // Basic validation - must contain FROM
    if (!trimmedQuery.includes('from')) {
      throw new Error('Query must contain FROM clause');
    }
  }

  /**
   * Execute a NRQL query via NerdGraph
   */
  async query(nrql: string, accountId?: string): Promise<any> {
    // Validate the NRQL query
    this.validateNRQL(nrql);

    const targetAccountId = accountId || this.defaultAccountId;

    const graphqlQuery = `
      query($accountId: Int!, $nrql: Nrql!) {
        actor {
          account(id: $accountId) {
            nrql(query: $nrql) {
              results
            }
          }
        }
      }
    `;

    const variables = {
      accountId: parseInt(targetAccountId, 10),
      nrql: nrql
    };

    logger.info('Executing NerdGraph query', {
      accountId: targetAccountId,
      nrql: nrql.substring(0, 100) // Log only first 100 chars
    });

    try {
      const response = await this.retryRequest(() =>
        this.client.post<NerdGraphResponse>('', {
          query: graphqlQuery,
          variables
        })
      );

      if (response.data.errors && response.data.errors.length > 0) {
        const error = response.data.errors[0];
        logger.error('NerdGraph query returned errors', {
          error: error.message,
          extensions: error.extensions
        });
        throw new Error(`NerdGraph error: ${error.message}`);
      }

      const results = response.data.data?.actor?.account?.nrql?.results;

      if (!results) {
        logger.warn('NerdGraph query returned no results', { nrql });
        return [];
      }

      logger.info('NerdGraph query completed successfully', {
        resultCount: results.length
      });

      return results;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('NerdGraph request failed', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        throw new Error(
          `NerdGraph request failed: ${error.response?.data?.errors?.[0]?.message || error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Retry logic for transient failures
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status) {
          const status = error.response.status;
          if (status >= 400 && status < 500 && status !== 429) {
            throw error;
          }
        }

        if (attempt < maxRetries) {
          logger.warn(`Request failed, retrying (${attempt}/${maxRetries})`, {
            error: (error as Error).message,
            nextRetryIn: delayMs * attempt
          });
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }

    throw lastError;
  }
}

export default NerdGraphClient;
