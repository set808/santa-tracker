import newrelic from 'newrelic';
import { SleighMetrics, SleighHealth, Location, DeliveryStop } from 'shared-types';
import { createLogger } from './logger';
import { generateRoute } from './route-generator';

const logger = createLogger('sleigh-simulator');

export class SleighSimulator {
  private static instance: SleighSimulator;
  private currentMetrics: SleighMetrics;
  private currentHealth: SleighHealth;
  private route: DeliveryStop[];
  private currentStopIndex: number = 0;
  private intervalId?: NodeJS.Timeout;
  private startTime: Date;
  private isChristmasEve: boolean = false;

  // Track previous values for change detection
  private previousFuelLevel: number = 100;
  private previousNavigationStatus: string = 'optimal';
  private previousStopIndex: number = 0;
  private fuelThresholdsLogged: Set<number> = new Set();

  private constructor() {
    this.startTime = new Date();
    this.route = generateRoute();
    this.isChristmasEve = this.checkIfChristmasEve();

    // Initialize at North Pole
    this.currentMetrics = {
      position: { lat: 90, lng: 0, altitude: 45000 },
      speed: 0,
      heading: 180,
      altitude: 45000,
      magicFuelLevel: 100,
      structuralIntegrity: 100,
      navigationStatus: 'optimal',
      nextStop: this.route[0]?.city || 'North Pole',
      distanceToNextStop: 0,
      timestamp: new Date().toISOString()
    };

    this.currentHealth = {
      engine: {
        performance: 100,
        temperature: 72,
        magicOutput: 21.5
      },
      navigation: {
        gpsAccuracy: 0.5,
        starTrackerStatus: 'online',
        compassCalibration: 100
      },
      communication: {
        northPoleLink: 'connected',
        latency: 12,
        bandwidth: 1000
      }
    };

    logger.info('Sleigh simulator initialized', {
      totalStops: this.route.length,
      isChristmasEve: this.isChristmasEve,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning'
    });
  }

  static getInstance(): SleighSimulator {
    if (!SleighSimulator.instance) {
      SleighSimulator.instance = new SleighSimulator();
    }
    return SleighSimulator.instance;
  }

  private checkIfChristmasEve(): boolean {
    // Always return true - this is Santa's practice run for Christmas Eve!
    return true;
  }

  start() {
    if (this.intervalId) {
      logger.warn('Simulator already running');
      return;
    }

    const updateInterval = this.isChristmasEve ? 2000 : 5000; // Faster on Christmas Eve

    this.intervalId = setInterval(() => {
      this.update();
    }, updateInterval);

    logger.info('Sleigh simulator started', {
      updateInterval,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning'
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Sleigh simulator stopped');
    }
  }

  private update() {
    const timeSinceStart = Date.now() - this.startTime.getTime();
    // 10-minute speedrun: 144x multiplier compresses 24 hours into 10 minutes
    const SIMULATION_SPEED_MULTIPLIER = 144;
    const hoursElapsed = (timeSinceStart / (1000 * 60 * 60)) * SIMULATION_SPEED_MULTIPLIER;

    if (!this.isChristmasEve) {
      // Route planning mode - simulate route analysis
      this.updateRoutePlanning(hoursElapsed);
    } else {
      // Christmas Eve mode - actual delivery
      this.updateChristmasEve(hoursElapsed);
    }

    // Send metrics to New Relic
    this.sendToNewRelic();
  }

  private updateRoutePlanning(hoursElapsed: number) {
    // In route planning mode, simulate test flights and route analysis
    const analysisProgress = Math.min((hoursElapsed / 24) * 100, 100);

    // Simulate test flights with varying speeds (oscillating pattern for visible variance)
    const timeInMinutes = hoursElapsed * 60;
    const speedWave1 = Math.sin(timeInMinutes / 5) * 2; // 5-minute cycle
    const speedWave2 = Math.cos(timeInMinutes / 3) * 1.5; // 3-minute cycle
    const baseSpeed = 3.5; // Average test flight speed
    const speed = Math.max(1, Math.min(6, baseSpeed + speedWave1 + speedWave2));

    // Altitude variations during test flights (oscillating between 35k-50k feet)
    const altitudeWave1 = Math.sin(timeInMinutes / 7) * 5000; // 7-minute cycle
    const altitudeWave2 = Math.cos(timeInMinutes / 4) * 3000; // 4-minute cycle
    const baseAltitude = 42500;
    const altitude = Math.max(35000, Math.min(50000, baseAltitude + altitudeWave1 + altitudeWave2));

    this.currentMetrics = {
      ...this.currentMetrics,
      speed,
      altitude,
      position: { ...this.currentMetrics.position, altitude },
      magicFuelLevel: 98 + Math.random() * 2, // Slight variance from refueling tests
      structuralIntegrity: 99 + Math.random(),
      navigationStatus: 'optimal',
      timestamp: new Date().toISOString()
    };

    // Simulate health fluctuations during system checks
    this.currentHealth.engine.performance = 95 + Math.random() * 5;
    this.currentHealth.navigation.gpsAccuracy = 0.3 + Math.random() * 0.5;
    this.currentHealth.communication.latency = 10 + Math.random() * 10;
  }

  private updateChristmasEve(hoursElapsed: number) {
    // Move to next stop based on time
    const expectedStops = Math.floor(hoursElapsed * 20); // ~20 stops per hour
    if (expectedStops > this.currentStopIndex && this.currentStopIndex < this.route.length) {
      this.currentStopIndex = Math.min(expectedStops, this.route.length - 1);
    }

    const currentStop = this.route[this.currentStopIndex];
    const nextStop = this.route[this.currentStopIndex + 1];

    if (currentStop && nextStop) {
      // Calculate position between current and next stop
      const progress = (expectedStops - this.currentStopIndex);
      const lat = currentStop.location.lat + (nextStop.location.lat - currentStop.location.lat) * progress;
      const lng = currentStop.location.lng + (nextStop.location.lng - currentStop.location.lng) * progress;

      // Calculate heading
      const heading = this.calculateHeading(currentStop.location, nextStop.location);

      // Calculate distance to next stop
      const distance = this.calculateDistance(
        { lat, lng, altitude: this.currentMetrics.altitude },
        nextStop.location
      );

      // Speed varies based on conditions (Mach 2-8)
      const baseSpeed = 5;
      const speedVariation = Math.sin(hoursElapsed) * 2;
      const speed = Math.max(2, Math.min(8, baseSpeed + speedVariation));

      // Fuel depletes over time
      const fuelUsed = (hoursElapsed / 24) * 40; // 40% over full journey
      const magicFuelLevel = Math.max(30, 100 - fuelUsed + Math.random() * 5);

      // Structural integrity degrades slightly
      const structuralIntegrity = Math.max(85, 100 - (hoursElapsed / 24) * 10);

      // Navigation status based on conditions
      const navigationStatus = magicFuelLevel < 40 ? 'degraded' :
                               magicFuelLevel < 20 ? 'critical' : 'optimal';

      // 🎅 FESTIVE LOGGING - Stop completion
      if (this.currentStopIndex > this.previousStopIndex && this.previousStopIndex > 0) {
        const completedStop = this.route[this.previousStopIndex];
        const percentComplete = (this.currentStopIndex / this.route.length) * 100;
        const remaining = this.route.length - this.currentStopIndex;

        logger.info(`🎁 ${completedStop.city}, ${completedStop.country} complete! ${completedStop.estimatedGifts.toLocaleString()} gifts delivered - ${this.currentStopIndex} of ${this.route.length} stops done!`, {
          city: completedStop.city,
          country: completedStop.country,
          giftsDelivered: completedStop.estimatedGifts,
          stopIndex: this.currentStopIndex,
          totalStops: this.route.length,
          percentComplete: Math.round(percentComplete),
          remainingStops: remaining
        });

        // Log progress milestones
        if (percentComplete >= 90 && this.previousStopIndex / this.route.length < 0.9) {
          logger.info(`🌟 That's ${Math.round(percentComplete)}% of the journey complete! Almost there! Just a few more chimneys to go!`, {
            percentComplete: Math.round(percentComplete),
            remainingStops: remaining
          });
        } else if (percentComplete >= 75 && this.previousStopIndex / this.route.length < 0.75) {
          logger.info(`🌟 That's ${Math.round(percentComplete)}% of the journey complete! Three quarters complete - the finish line is in sight!`, {
            percentComplete: Math.round(percentComplete),
            remainingStops: remaining
          });
        } else if (percentComplete >= 50 && this.previousStopIndex / this.route.length < 0.5) {
          logger.info(`🌟 That's ${Math.round(percentComplete)}% of the journey complete! HALFWAY DONE! The night is still young!`, {
            percentComplete: Math.round(percentComplete),
            remainingStops: remaining
          });
        } else if (percentComplete >= 25 && this.previousStopIndex / this.route.length < 0.25) {
          logger.info(`🌟 That's ${Math.round(percentComplete)}% of the journey complete! Quarter of the way there - just getting warmed up!`, {
            percentComplete: Math.round(percentComplete),
            remainingStops: remaining
          });
        }
      }

      // 🎅 FESTIVE LOGGING - Fuel level thresholds
      if (magicFuelLevel <= 75 && this.previousFuelLevel > 75 && !this.fuelThresholdsLogged.has(75)) {
        logger.info('⛽ Magic fuel reserves at 75% - still plenty of Christmas magic in the tank!', {
          magicFuelLevel: Math.round(magicFuelLevel),
          threshold: 75
        });
        this.fuelThresholdsLogged.add(75);
      } else if (magicFuelLevel <= 50 && this.previousFuelLevel > 50 && !this.fuelThresholdsLogged.has(50)) {
        logger.info('🎄 Halfway through the magic fuel - Santa\'s making great progress!', {
          magicFuelLevel: Math.round(magicFuelLevel),
          threshold: 50
        });
        this.fuelThresholdsLogged.add(50);
      } else if (magicFuelLevel <= 40 && this.previousFuelLevel > 40 && !this.fuelThresholdsLogged.has(40)) {
        logger.warn('⚠️ Magic fuel at 40% - keep an eye on those reserves, elves!', {
          magicFuelLevel: Math.round(magicFuelLevel),
          threshold: 40
        });
        this.fuelThresholdsLogged.add(40);
      } else if (magicFuelLevel <= 20 && this.previousFuelLevel > 20 && !this.fuelThresholdsLogged.has(20)) {
        logger.warn('🚨 Running low on Christmas magic! Only 20% fuel remaining!', {
          magicFuelLevel: Math.round(magicFuelLevel),
          threshold: 20
        });
        this.fuelThresholdsLogged.add(20);
      }

      // 🎅 FESTIVE LOGGING - Navigation status changes
      if (navigationStatus !== this.previousNavigationStatus) {
        if (navigationStatus === 'optimal') {
          logger.info('🧭 Navigation systems showing optimal status - as precise as Rudolph\'s nose is bright!', {
            navigationStatus,
            previousStatus: this.previousNavigationStatus
          });
        } else if (navigationStatus === 'degraded') {
          logger.warn('🧭 Navigation systems showing degraded status - a bit cloudy, but Santa knows the way!', {
            navigationStatus,
            previousStatus: this.previousNavigationStatus,
            magicFuelLevel: Math.round(magicFuelLevel)
          });
        } else if (navigationStatus === 'critical') {
          logger.error('⚠️ GPS is acting naughty, not nice! Manual navigation engaged!', {
            navigationStatus,
            previousStatus: this.previousNavigationStatus,
            magicFuelLevel: Math.round(magicFuelLevel)
          });
        }
        this.previousNavigationStatus = navigationStatus;
      }

      // 🎅 FESTIVE LOGGING - Location updates (every 10 stops or significant events)
      if (this.currentStopIndex % 10 === 0 && this.currentStopIndex !== this.previousStopIndex) {
        const altitude = Math.round(40000 + Math.random() * 10000);
        logger.info(`🎅 Ho ho ho! Santa's sleigh is soaring over ${currentStop.city} at ${altitude}ft, cruising at Mach ${speed.toFixed(1)}!`, {
          city: currentStop.city,
          country: currentStop.country,
          latitude: lat.toFixed(2),
          longitude: lng.toFixed(2),
          altitude,
          speed: speed.toFixed(1),
          heading: Math.round(heading)
        });

        logger.info(`✨ ${Math.round(distance)} miles until our next stop in ${nextStop.city} - the children are waiting!`, {
          nextStop: nextStop.city,
          distanceToNextStop: Math.round(distance)
        });
      }

      // 🎅 FESTIVE LOGGING - Health status warnings
      const enginePerformance = Math.max(70, 100 - (hoursElapsed / 24) * 20 + Math.random() * 5);
      const commLatency = 12 + (hoursElapsed / 24) * 50 + Math.random() * 20;

      if (structuralIntegrity < 90 && this.currentMetrics.structuralIntegrity >= 90) {
        logger.warn(`🛷 Sleigh integrity at ${Math.round(structuralIntegrity)}% - holding strong but showing signs of the long journey!`, {
          structuralIntegrity: Math.round(structuralIntegrity)
        });
      }

      if (enginePerformance < 80 && this.currentHealth.engine.performance >= 80) {
        logger.warn(`🔥 Engine performance at ${Math.round(enginePerformance)}% - working hard but could use some North Pole TLC!`, {
          enginePerformance: Math.round(enginePerformance)
        });
      }

      if (commLatency > 50 && this.currentHealth.communication.latency <= 50) {
        logger.warn(`📡 North Pole connection: ${Math.round(commLatency)}ms - getting a bit laggy, might need to boost the signal!`, {
          latency: Math.round(commLatency)
        });
      }

      this.currentMetrics = {
        position: { lat, lng, altitude: 40000 + Math.random() * 10000 },
        speed,
        heading,
        altitude: 40000 + Math.random() * 10000,
        magicFuelLevel,
        structuralIntegrity,
        navigationStatus: navigationStatus as any,
        nextStop: nextStop.city,
        distanceToNextStop: distance,
        timestamp: new Date().toISOString()
      };

      // Health degrades over time
      this.currentHealth.engine.performance = enginePerformance;
      this.currentHealth.engine.temperature = 72 + (hoursElapsed / 24) * 30 + Math.random() * 10;
      this.currentHealth.engine.magicOutput = Math.max(15, 21.5 - (hoursElapsed / 24) * 5);
      this.currentHealth.navigation.gpsAccuracy = 0.5 + (hoursElapsed / 24) * 2;
      this.currentHealth.communication.latency = commLatency;

      // Update tracking variables
      this.previousFuelLevel = magicFuelLevel;
      this.previousStopIndex = this.currentStopIndex;
    }
  }

  private calculateHeading(from: Location, to: Location): number {
    const dLon = (to.lng - from.lng) * Math.PI / 180;
    const lat1 = from.lat * Math.PI / 180;
    const lat2 = to.lat * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
  }

  private calculateDistance(from: Location, to: Location): number {
    const R = 3959; // Earth's radius in miles
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLon = (to.lng - from.lng) * Math.PI / 180;

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private sendToNewRelic() {
    // Record custom event with all sleigh metrics
    // Flatten position object for New Relic
    const { position, ...metricsWithoutPosition } = this.currentMetrics;

    newrelic.recordCustomEvent('SantaLocation', {
      ...metricsWithoutPosition,
      latitude: position.lat,
      longitude: position.lng,
      altitude: position.altitude,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning',
      stopIndex: this.currentStopIndex,
      totalStops: this.route.length,
      percentComplete: (this.currentStopIndex / this.route.length) * 100
    });

    // Record custom metrics for dashboards
    newrelic.recordMetric('Custom/Sleigh/Speed', this.currentMetrics.speed);
    newrelic.recordMetric('Custom/Sleigh/Altitude', this.currentMetrics.altitude);
    newrelic.recordMetric('Custom/Sleigh/FuelLevel', this.currentMetrics.magicFuelLevel);
    newrelic.recordMetric('Custom/Sleigh/StructuralIntegrity', this.currentMetrics.structuralIntegrity);
    newrelic.recordMetric('Custom/Sleigh/EnginePerformance', this.currentHealth.engine.performance);
    newrelic.recordMetric('Custom/Sleigh/EngineTemperature', this.currentHealth.engine.temperature);
    newrelic.recordMetric('Custom/Sleigh/MagicOutput', this.currentHealth.engine.magicOutput);
    newrelic.recordMetric('Custom/Sleigh/GPSAccuracy', this.currentHealth.navigation.gpsAccuracy);
    newrelic.recordMetric('Custom/Sleigh/CommunicationLatency', this.currentHealth.communication.latency);
  }

  getMetrics(): SleighMetrics {
    return { ...this.currentMetrics };
  }

  getHealth(): SleighHealth {
    return { ...this.currentHealth };
  }

  getRoute(): DeliveryStop[] {
    return [...this.route];
  }

  getCurrentStop(): DeliveryStop | null {
    return this.route[this.currentStopIndex] || null;
  }
}
