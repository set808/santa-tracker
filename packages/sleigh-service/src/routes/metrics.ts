import { Router } from 'express';
import newrelic from 'newrelic';
import { SleighSimulator } from '../simulator';

export const metricsRouter = Router();
const simulator = SleighSimulator.getInstance();

// Get current sleigh metrics
metricsRouter.get('/current', (req, res) => {
  try {
    const metrics = simulator.getMetrics();

    // Add custom attributes to transaction
    newrelic.addCustomAttributes({
      endpoint: 'sleigh-metrics',
      speed: metrics.speed,
      altitude: metrics.altitude,
      fuelLevel: metrics.magicFuelLevel
    });

    res.json(metrics);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch sleigh metrics' });
  }
});

// Get sleigh health status
metricsRouter.get('/health-status', (req, res) => {
  try {
    const health = simulator.getHealth();

    newrelic.addCustomAttributes({
      endpoint: 'sleigh-health',
      enginePerformance: health.engine.performance,
      navigationStatus: health.navigation.starTrackerStatus
    });

    res.json(health);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch sleigh health' });
  }
});

// Get delivery route
metricsRouter.get('/route', (req, res) => {
  try {
    const route = simulator.getRoute();

    newrelic.addCustomAttributes({
      endpoint: 'sleigh-route',
      totalStops: route.length
    });

    res.json(route);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
});

// Get current stop
metricsRouter.get('/current-stop', (req, res) => {
  try {
    const stop = simulator.getCurrentStop();

    if (!stop) {
      return res.json({ message: 'No current stop - at North Pole' });
    }

    newrelic.addCustomAttributes({
      endpoint: 'current-stop',
      city: stop.city,
      country: stop.country
    });

    res.json(stop);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch current stop' });
  }
});
