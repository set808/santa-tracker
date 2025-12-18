import { Router } from 'express';
import newrelic from 'newrelic';
import { WeatherSimulator } from '../simulator';

export const metricsRouter = Router();
const simulator = WeatherSimulator.getInstance();

// Get current weather conditions
metricsRouter.get('/current', (req, res) => {
  try {
    const weather = simulator.getCurrentWeather();

    newrelic.addCustomAttributes({
      endpoint: 'weather-current',
      location: weather.location,
      severity: weather.severity,
      precipitation: weather.precipitation
    });

    res.json(weather);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
});

// Get weather forecast
metricsRouter.get('/forecast', (req, res) => {
  try {
    const forecast = simulator.getForecast();

    newrelic.addCustomAttributes({
      endpoint: 'weather-forecast',
      location: forecast.location
    });

    res.json(forecast);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch weather forecast' });
  }
});

// Get active weather alerts
metricsRouter.get('/alerts', (req, res) => {
  try {
    const includeAll = req.query.all === 'true';
    const alerts = includeAll ? simulator.getAllAlerts() : simulator.getAlerts();

    newrelic.addCustomAttributes({
      endpoint: 'weather-alerts',
      activeAlerts: alerts.filter(a => a.active).length,
      totalAlerts: alerts.length
    });

    res.json(alerts);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});
