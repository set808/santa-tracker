import { Router } from 'express';
import newrelic from 'newrelic';
import { IncidentGenerator } from '../incident-generator';

export const metricsRouter = Router();
const generator = IncidentGenerator.getInstance();

metricsRouter.get('/active', (req, res) => {
  try {
    const incidents = generator.getActiveIncidents();
    newrelic.addCustomAttributes({
      endpoint: 'active-incidents',
      count: incidents.length
    });
    res.json(incidents);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch active incidents' });
  }
});

metricsRouter.get('/all', (req, res) => {
  try {
    const incidents = generator.getAllIncidents();
    newrelic.addCustomAttributes({
      endpoint: 'all-incidents',
      count: incidents.length
    });
    res.json(incidents);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

metricsRouter.get('/stats', (req, res) => {
  try {
    const stats = generator.getStats();
    newrelic.addCustomAttributes({
      endpoint: 'incident-stats',
      activeCount: stats.active
    });
    res.json(stats);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

metricsRouter.get('/:id', (req, res) => {
  try {
    const incident = generator.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    newrelic.addCustomAttributes({
      endpoint: 'incident-by-id',
      incidentId: req.params.id
    });
    res.json(incident);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch incident' });
  }
});
