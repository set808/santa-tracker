import { Router } from 'express';
import newrelic from 'newrelic';
import { ReindeerSimulator } from '../simulator';
import { ReindeerName } from 'shared-types';
import { createLogger } from '../logger';

const logger = createLogger('metrics-routes');
export const metricsRouter = Router();

const simulator = ReindeerSimulator.getInstance();

// Get all reindeer statuses
metricsRouter.get('/all', (req, res) => {
  try {
    const allStatuses = simulator.getAllReindeerStatuses();

    newrelic.addCustomAttributes({
      endpoint: 'metrics-all',
      reindeerCount: allStatuses.length
    });

    logger.info('All reindeer statuses requested', {
      count: allStatuses.length
    });

    res.json({
      reindeer: allStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching all reindeer statuses', { error });
    newrelic.noticeError(error as Error);
    res.status(500).json({
      error: 'Failed to fetch reindeer statuses',
      message: (error as Error).message
    });
  }
});

// Get specific reindeer status
metricsRouter.get('/:name', (req, res) => {
  try {
    const name = req.params.name as ReindeerName;

    // Validate reindeer name
    const validNames: ReindeerName[] = [
      'Dasher',
      'Dancer',
      'Prancer',
      'Vixen',
      'Comet',
      'Cupid',
      'Donner',
      'Blitzen',
      'Rudolph'
    ];

    if (!validNames.includes(name)) {
      logger.warn('Invalid reindeer name requested', { name });
      return res.status(404).json({
        error: 'Reindeer not found',
        message: `${name} is not a valid reindeer name`,
        validNames
      });
    }

    const status = simulator.getReindeerStatus(name);

    if (!status) {
      logger.warn('Reindeer status not found', { name });
      return res.status(404).json({
        error: 'Reindeer status not found',
        name
      });
    }

    newrelic.addCustomAttributes({
      endpoint: 'metrics-single',
      reindeerName: name,
      reindeerStatus: status.status,
      energy: status.energy
    });

    logger.info('Reindeer status requested', {
      name,
      status: status.status,
      energy: status.energy
    });

    res.json({
      reindeer: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching reindeer status', {
      name: req.params.name,
      error
    });
    newrelic.noticeError(error as Error);
    res.status(500).json({
      error: 'Failed to fetch reindeer status',
      message: (error as Error).message
    });
  }
});

// Get team averages
metricsRouter.get('/team/average', (req, res) => {
  try {
    const averages = simulator.getTeamAverages();

    newrelic.addCustomAttributes({
      endpoint: 'metrics-team-average',
      averageEnergy: averages.averageEnergy,
      averageHealth: averages.averageHealth,
      averageMorale: averages.averageMorale
    });

    logger.info('Team averages requested', {
      averageEnergy: averages.averageEnergy.toFixed(2),
      averageHealth: averages.averageHealth.toFixed(2),
      averageMorale: averages.averageMorale.toFixed(2)
    });

    res.json({
      teamAverages: {
        ...averages,
        // Round to 2 decimal places for cleaner output
        averageEnergy: Math.round(averages.averageEnergy * 100) / 100,
        averageHealth: Math.round(averages.averageHealth * 100) / 100,
        averageMorale: Math.round(averages.averageMorale * 100) / 100,
        averageSpeedContribution: Math.round(averages.averageSpeedContribution * 100) / 100
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching team averages', { error });
    newrelic.noticeError(error as Error);
    res.status(500).json({
      error: 'Failed to fetch team averages',
      message: (error as Error).message
    });
  }
});
