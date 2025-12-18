import newrelic from 'newrelic';
import { Incident, IncidentType, IncidentSeverity } from 'shared-types';
import { createLogger } from './logger';

const logger = createLogger('incident-generator');

const INCIDENT_TEMPLATES: Record<IncidentType, {
  titles: string[],
  descriptions: string[],
  realWorldAnalogy: string
}> = {
  'weather-delay': {
    titles: ['Severe Weather Detected', 'Blizzard Conditions', 'Heavy Snowfall Slowing Delivery'],
    descriptions: [
      'Intense snowstorm reducing visibility to near zero. Sleigh speed reduced by 40%.',
      'Unexpected blizzard forcing altitude adjustment. Navigation systems compensating.',
      'High winds creating turbulence. Reindeer maintaining formation with difficulty.'
    ],
    realWorldAnalogy: 'Network latency spike due to infrastructure issues'
  },
  'reindeer-fatigue': {
    titles: ['Reindeer Energy Low', 'Team Fatigue Warning', 'Rest Break Needed'],
    descriptions: [
      'Multiple reindeer showing signs of exhaustion. Reducing speed to conserve energy.',
      'Dasher and Dancer energy levels below optimal. Brief landing recommended.',
      'Team morale declining after continuous flight. Cookie break scheduled.'
    ],
    realWorldAnalogy: 'Server CPU/Memory exhaustion requiring scaling'
  },
  'chimney-obstruction': {
    titles: ['Chimney Access Blocked', 'Entry Point Compromised', 'Alternative Route Required'],
    descriptions: [
      'Chimney blocked by debris. Searching for alternative entry point.',
      'Fireplace active - too hot for safe entry. Waiting for clearance.',
      'Chimney too narrow for standard approach. Deploying miniaturization protocol.'
    ],
    realWorldAnalogy: 'API endpoint timeout or blocked route'
  },
  'airspace-conflict': {
    titles: ['Airspace Coordination Issue', 'Flight Path Conflict', 'Route Adjustment Needed'],
    descriptions: [
      'Commercial aircraft detected in delivery zone. Adjusting altitude.',
      'Military training exercise active. Coordinating with local authorities.',
      'Drone activity reported. Temporary route deviation required.'
    ],
    realWorldAnalogy: 'Rate limiting or throttling from external service'
  },
  'fuel-low': {
    titles: ['Magic Fuel Below Threshold', 'Energy Reserves Depleting', 'Refuel Required'],
    descriptions: [
      'Magic fuel at 35%. Landing at intermediate checkpoint for replenishment.',
      'Unexpected energy consumption detected. Optimizing power distribution.',
      'Fuel efficiency degraded due to weather. Emergency reserves activated.'
    ],
    realWorldAnalogy: 'Resource exhaustion - memory leak or connection pool depletion'
  },
  'gift-mismatch': {
    titles: ['Inventory Discrepancy', 'Gift Manifest Error', 'List Synchronization Issue'],
    descriptions: [
      'Naughty/Nice list update not synced. Reconciling data with North Pole.',
      'Gift count mismatch detected. Reindexing inventory database.',
      'Last-minute list changes causing delays. Updating delivery priorities.'
    ],
    realWorldAnalogy: 'Data inconsistency between services or cache invalidation'
  },
  'navigation-error': {
    titles: ['GPS Malfunction', 'Star Tracker Offline', 'Position Uncertainty'],
    descriptions: [
      'Northern lights interfering with GPS signal. Switching to star navigation.',
      'Compass calibration drift detected. Recalibrating navigation systems.',
      'Magnetic anomaly affecting heading. Manual course correction applied.'
    ],
    realWorldAnalogy: 'Service discovery failure or DNS resolution issues'
  },
  'communication-loss': {
    titles: ['North Pole Link Down', 'Communication Interrupted', 'Signal Degradation'],
    descriptions: [
      'Lost contact with mission control. Operating on cached instructions.',
      'Satellite link unstable. Switching to backup communication channels.',
      'Aurora borealis causing radio interference. Restoring communication.'
    ],
    realWorldAnalogy: 'Message queue failure or service mesh communication breakdown'
  }
};

export class IncidentGenerator {
  private static instance: IncidentGenerator;
  private activeIncidents: Map<string, Incident> = new Map();
  private incidentHistory: Incident[] = [];
  private intervalId?: NodeJS.Timeout;
  private incidentCounter = 0;
  private isChristmasEve: boolean = false;

  private constructor() {
    this.isChristmasEve = this.checkIfChristmasEve();
    logger.info('Incident generator initialized', {
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning'
    });
  }

  static getInstance(): IncidentGenerator {
    if (!IncidentGenerator.instance) {
      IncidentGenerator.instance = new IncidentGenerator();
    }
    return IncidentGenerator.instance;
  }

  private checkIfChristmasEve(): boolean {
    // Always return true - this is Santa's practice run for Christmas Eve!
    return true;
  }

  start() {
    if (this.intervalId) {
      logger.warn('Generator already running');
      return;
    }

    const checkInterval = this.isChristmasEve ? 60000 : 120000; // Check every 1-2 minutes

    this.intervalId = setInterval(() => {
      this.checkAndGenerateIncident();
      this.checkAndResolveIncidents();
    }, checkInterval);

    logger.info('Incident generator started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Incident generator stopped');
    }
  }

  private checkAndGenerateIncident() {
    // Higher chance during Christmas Eve
    const incidentProbability = this.isChristmasEve ? 0.35 : 0.05; // 35% vs 5%

    if (Math.random() < incidentProbability) {
      const incident = this.generateIncident();
      this.activeIncidents.set(incident.id, incident);
      this.incidentHistory.push(incident);

      logger.warn('New incident created', {
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        location: incident.location
      });

      // Send to New Relic
      newrelic.recordCustomEvent('SantaIncident', {
        ...incident,
        status: 'created'
      });
    }
  }

  private generateIncident(): Incident {
    const types: IncidentType[] = [
      'weather-delay',
      'reindeer-fatigue',
      'chimney-obstruction',
      'airspace-conflict',
      'fuel-low',
      'gift-mismatch',
      'navigation-error',
      'communication-loss'
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const template = INCIDENT_TEMPLATES[type];
    const severity = this.generateSeverity(type);

    this.incidentCounter++;

    return {
      id: `INC-${Date.now()}-${this.incidentCounter}`,
      type,
      severity,
      title: template.titles[Math.floor(Math.random() * template.titles.length)],
      description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
      location: this.generateLocation(),
      timestamp: new Date().toISOString(),
      status: 'active',
      impactedSystems: this.generateImpactedSystems(type),
      realWorldAnalogy: template.realWorldAnalogy
    };
  }

  private generateSeverity(type: IncidentType): IncidentSeverity {
    // Some incident types are inherently more severe
    const severityWeights: Record<IncidentType, { low: number, medium: number, high: number, critical: number }> = {
      'weather-delay': { low: 20, medium: 50, high: 25, critical: 5 },
      'reindeer-fatigue': { low: 10, medium: 40, high: 40, critical: 10 },
      'chimney-obstruction': { low: 60, medium: 30, high: 10, critical: 0 },
      'airspace-conflict': { low: 30, medium: 50, high: 15, critical: 5 },
      'fuel-low': { low: 5, medium: 30, high: 45, critical: 20 },
      'gift-mismatch': { low: 50, medium: 40, high: 10, critical: 0 },
      'navigation-error': { low: 20, medium: 40, high: 30, critical: 10 },
      'communication-loss': { low: 30, medium: 40, high: 25, critical: 5 }
    };

    const weights = severityWeights[type];
    const roll = Math.random() * 100;

    if (roll < weights.low) return 'low';
    if (roll < weights.low + weights.medium) return 'medium';
    if (roll < weights.low + weights.medium + weights.high) return 'high';
    return 'critical';
  }

  private generateLocation(): string {
    const locations = [
      'Over Pacific Ocean',
      'Tokyo Airspace',
      'North Pole',
      'London Region',
      'New York Metro',
      'Sydney Harbor',
      'Moscow Vicinity',
      'Dubai Airspace',
      'São Paulo Region',
      'Cairo District',
      'Mumbai Sector',
      'Beijing Area'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private generateImpactedSystems(type: IncidentType): string[] {
    const systemMap: Record<IncidentType, string[]> = {
      'weather-delay': ['Navigation', 'Flight Control', 'Weather Monitoring'],
      'reindeer-fatigue': ['Propulsion', 'Team Performance', 'Health Monitoring'],
      'chimney-obstruction': ['Delivery System', 'Entry Protocol'],
      'airspace-conflict': ['Traffic Control', 'Route Planning', 'Communication'],
      'fuel-low': ['Power Management', 'Engine Control', 'Fuel System'],
      'gift-mismatch': ['Inventory', 'Database Sync', 'List Management'],
      'navigation-error': ['GPS', 'Star Tracker', 'Compass', 'Navigation Computer'],
      'communication-loss': ['Satellite Link', 'Radio', 'North Pole Uplink']
    };
    return systemMap[type];
  }

  private checkAndResolveIncidents() {
    const now = Date.now();

    this.activeIncidents.forEach((incident, id) => {
      const incidentAge = now - new Date(incident.timestamp).getTime();
      const resolutionTime = this.getResolutionTime(incident.severity);

      if (incidentAge > resolutionTime) {
        incident.status = 'resolved';
        incident.resolutionTime = new Date().toISOString();
        this.activeIncidents.delete(id);

        logger.info('Incident resolved', {
          id: incident.id,
          duration: incidentAge / 1000,
          type: incident.type
        });

        newrelic.recordCustomEvent('SantaIncident', {
          ...incident,
          status: 'resolved',
          duration: incidentAge
        });
      }
    });
  }

  private getResolutionTime(severity: IncidentSeverity): number {
    // Resolution time in milliseconds
    const times: Record<IncidentSeverity, number> = {
      'low': 5 * 60 * 1000,      // 5 minutes
      'medium': 10 * 60 * 1000,  // 10 minutes
      'high': 20 * 60 * 1000,    // 20 minutes
      'critical': 30 * 60 * 1000 // 30 minutes
    };
    return times[severity];
  }

  getActiveIncidents(): Incident[] {
    return Array.from(this.activeIncidents.values());
  }

  getAllIncidents(): Incident[] {
    return [...this.incidentHistory];
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidentHistory.find(inc => inc.id === id);
  }

  getStats() {
    const active = this.activeIncidents.size;
    const total = this.incidentHistory.length;
    const resolved = total - active;

    const bySeverity = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.incidentHistory.forEach(inc => {
      bySeverity[inc.severity]++;
    });

    return {
      active,
      resolved,
      total,
      bySeverity
    };
  }
}
