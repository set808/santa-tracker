import { Router } from 'express';
import newrelic from 'newrelic';
import { DeliverySimulator } from '../simulator';

export const metricsRouter = Router();
const simulator = DeliverySimulator.getInstance();

// Get total delivery metrics
metricsRouter.get('/total', (req, res) => {
  try {
    const metrics = simulator.getMetrics();

    newrelic.addCustomAttributes({
      endpoint: 'delivery-total',
      totalGifts: metrics.totalGiftsDelivered,
      deliveryRate: metrics.deliveryRate
    });

    res.json(metrics);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch total delivery metrics' });
  }
});

// Get delivery metrics by region
metricsRouter.get('/by-region', (req, res) => {
  try {
    const regionalStats = simulator.getRegionalStats();

    newrelic.addCustomAttributes({
      endpoint: 'delivery-by-region',
      totalRegions: regionalStats.length
    });

    res.json(regionalStats);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch regional delivery metrics' });
  }
});

// Get delivery metrics by country
metricsRouter.get('/by-country', (req, res) => {
  try {
    const countryStats = simulator.getCountryStats();

    newrelic.addCustomAttributes({
      endpoint: 'delivery-by-country',
      totalCountries: countryStats.length
    });

    res.json(countryStats);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch country delivery metrics' });
  }
});

// Get delivery rate metrics
metricsRouter.get('/rate', (req, res) => {
  try {
    const rateMetrics = simulator.getRateMetrics();

    newrelic.addCustomAttributes({
      endpoint: 'delivery-rate',
      currentRate: rateMetrics.currentRate,
      averageRate: rateMetrics.averageRate
    });

    res.json(rateMetrics);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch delivery rate metrics' });
  }
});
