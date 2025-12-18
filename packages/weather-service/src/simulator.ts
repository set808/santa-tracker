import newrelic from 'newrelic';
import { createLogger } from './logger';
import { WeatherConditions } from 'shared-types';

const logger = createLogger('weather-simulator');

export type WeatherCondition = 'clear' | 'light-snow' | 'heavy-snow' | 'rain' | 'blizzard';
export type Severity = 'clear' | 'moderate' | 'severe' | 'extreme';

export interface CurrentWeather extends WeatherConditions {
  location: string;
  temperature: number; // Fahrenheit
  windSpeed: number; // mph
  windDirection: number; // degrees
  visibility: number; // miles
  precipitation: WeatherCondition;
  severity: Severity;
  impact: string;
  forecast: string;
}

export interface WeatherAlert {
  id: string;
  location: string;
  severity: Severity;
  type: string;
  description: string;
  startTime: string;
  endTime?: string;
  active: boolean;
}

export interface ForecastData {
  location: string;
  nextHour: CurrentWeather;
  next3Hours: CurrentWeather;
  next6Hours: CurrentWeather;
  timestamp: string;
}

// Famous locations Santa visits
const LOCATIONS = [
  'North Pole',
  'Tokyo, Japan',
  'Sydney, Australia',
  'London, UK',
  'Paris, France',
  'New York, USA',
  'Los Angeles, USA',
  'Moscow, Russia',
  'Beijing, China',
  'Mumbai, India',
  'Dubai, UAE',
  'Cairo, Egypt',
  'Lagos, Nigeria',
  'Johannesburg, South Africa',
  'São Paulo, Brazil',
  'Buenos Aires, Argentina',
  'Toronto, Canada',
  'Mexico City, Mexico'
];

export class WeatherSimulator {
  private static instance: WeatherSimulator;
  private currentWeather: CurrentWeather;
  private currentLocationIndex: number = 0;
  private weatherAlerts: WeatherAlert[] = [];
  private intervalId?: NodeJS.Timeout;
  private startTime: Date;

  // Track previous values for festive logging
  private previousLocation: string = '';
  private previousCondition: WeatherCondition = 'clear';
  private previousSeverity: Severity = 'mild';
  private locationStartTime: number = Date.now();

  private constructor() {
    this.startTime = new Date();
    this.currentLocationIndex = 0;

    // Initialize with North Pole weather
    this.currentWeather = this.generateWeather('North Pole');

    logger.info('Weather simulator initialized', {
      initialLocation: this.currentWeather.location,
      initialCondition: this.currentWeather.precipitation
    });
  }

  static getInstance(): WeatherSimulator {
    if (!WeatherSimulator.instance) {
      WeatherSimulator.instance = new WeatherSimulator();
    }
    return WeatherSimulator.instance;
  }

  start() {
    if (this.intervalId) {
      logger.warn('Simulator already running');
      return;
    }

    // Update every 5 seconds
    const updateInterval = 5000;

    this.intervalId = setInterval(() => {
      this.update();
    }, updateInterval);

    logger.info('Weather simulator started', {
      updateInterval
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Weather simulator stopped');
    }
  }

  private update() {
    const timeSinceStart = Date.now() - this.startTime.getTime();
    // 10-minute speedrun: 144x multiplier compresses 24 hours into 10 minutes
    const SIMULATION_SPEED_MULTIPLIER = 144;
    const minutesElapsed = (timeSinceStart / (1000 * 60)) * SIMULATION_SPEED_MULTIPLIER;

    // Change location every 5 minutes
    if (minutesElapsed % 5 < 0.1) {
      this.currentLocationIndex = (this.currentLocationIndex + 1) % LOCATIONS.length;
    }

    const location = LOCATIONS[this.currentLocationIndex];

    // 🎅 FESTIVE LOGGING - Location changes
    if (location !== this.previousLocation && this.previousLocation !== '') {
      const duration = Math.round((Date.now() - this.locationStartTime) / 1000 / 60); // minutes
      logger.info(`🗺️ Weather monitoring moving from ${this.previousLocation} to ${location} after ${duration} minutes`, {
        previousLocation: this.previousLocation,
        newLocation: location,
        durationMinutes: duration
      });
      this.locationStartTime = Date.now();
    }

    // Store previous weather for comparison
    const previousCondition = this.currentWeather?.precipitation;
    const previousSeverity = this.currentWeather?.severity;

    // Generate new weather for current location
    this.currentWeather = this.generateWeather(location);

    // 🎅 FESTIVE LOGGING - Weather condition changes
    if (previousCondition && previousCondition !== this.currentWeather.precipitation) {
      const conditionMessages: Record<string, string> = {
        'clear': '☀️ Skies clearing - smooth flying ahead!',
        'light-snow': '❄️ Light snow beginning - perfect Christmas weather!',
        'heavy-snow': '🌨️ Heavy snow developing - Santa\'s got his snow gear on!',
        'blizzard': '🌨️ Blizzard conditions developing! Santa\'s got his storm gear on!',
        'rain': '🌧️ Rain starting to fall - good thing reindeer don\'t mind getting wet!'
      };

      const message = conditionMessages[this.currentWeather.precipitation] ||
                      `Weather changing to ${this.currentWeather.precipitation}`;
      logger.info(`${message} over ${location}`, {
        location,
        previousCondition,
        newCondition: this.currentWeather.precipitation,
        temperature: this.currentWeather.temperature,
        windSpeed: this.currentWeather.windSpeed,
        visibility: this.currentWeather.visibility
      });
    }

    // 🎅 FESTIVE LOGGING - Severity changes
    if (previousSeverity && previousSeverity !== this.currentWeather.severity) {
      logger.info(`Weather changing from ${previousSeverity} to ${this.currentWeather.severity} severity at ${location}`, {
        location,
        previousSeverity,
        newSeverity: this.currentWeather.severity,
        impact: this.currentWeather.impact
      });
    }

    // 🎅 FESTIVE LOGGING - Critical weather conditions
    if (this.currentWeather.visibility < 2 && (!previousCondition || this.currentWeather.visibility < 2)) {
      logger.warn(`👁️ Visibility down to ${this.currentWeather.visibility}km at ${location} - Rudolph's nose is extra helpful right now!`, {
        location,
        visibility: this.currentWeather.visibility,
        condition: this.currentWeather.precipitation
      });
    }

    if (this.currentWeather.windSpeed > 50) {
      logger.warn(`💨 Winds hitting ${this.currentWeather.windSpeed}kt at ${location}! Holding on tight to those reins!`, {
        location,
        windSpeed: this.currentWeather.windSpeed,
        windDirection: this.currentWeather.windDirection
      });
    }

    if (this.currentWeather.temperature < -20) {
      logger.warn(`🥶 Brrr! ${this.currentWeather.temperature}°F at ${location} - even Santa's bundling up!`, {
        location,
        temperature: this.currentWeather.temperature
      });
    }

    // Perfect conditions
    if (this.currentWeather.precipitation === 'clear' &&
        this.currentWeather.windSpeed < 15 &&
        this.currentWeather.visibility > 8 &&
        previousCondition !== 'clear') {
      logger.info(`🌟 Perfect flying weather over ${location}! Clear skies, calm winds - couldn't ask for better!`, {
        location,
        condition: this.currentWeather.precipitation,
        windSpeed: this.currentWeather.windSpeed,
        visibility: this.currentWeather.visibility
      });
    }

    this.previousLocation = location;
    this.previousCondition = this.currentWeather.precipitation;
    this.previousSeverity = this.currentWeather.severity;

    // Check for weather alerts
    this.checkForAlerts();

    // Send metrics to New Relic
    this.sendToNewRelic();
  }

  private generateWeather(location: string): CurrentWeather {
    // Generate realistic weather conditions
    // More extreme weather at certain locations (North Pole, high latitudes)
    const isNorthPole = location.includes('North Pole');
    const isHighLatitude = location.includes('Moscow') || location.includes('Toronto') || location.includes('London');

    // Temperature varies by location and randomness
    let baseTemp: number;
    if (isNorthPole) {
      baseTemp = -30 + Math.random() * 20; // -30 to -10°F
    } else if (isHighLatitude) {
      baseTemp = 10 + Math.random() * 40; // 10 to 50°F
    } else {
      baseTemp = 30 + Math.random() * 40; // 30 to 70°F
    }
    const temperature = Math.round(baseTemp);

    // Wind speed - higher at higher altitudes and certain conditions
    const baseWindSpeed = Math.random() * 30; // 0-30 mph base
    const windVariance = Math.random() * 30; // Additional variance
    const windSpeed = Math.round(baseWindSpeed + windVariance);

    // Wind direction (0-360 degrees)
    const windDirection = Math.round(Math.random() * 360);

    // Determine precipitation based on temperature and randomness
    let precipitation: WeatherCondition;
    const precipChance = Math.random();

    if (temperature < 32) {
      // Snow conditions when below freezing
      if (precipChance < 0.3) {
        precipitation = 'clear';
      } else if (precipChance < 0.6) {
        precipitation = 'light-snow';
      } else if (precipChance < 0.85) {
        precipitation = 'heavy-snow';
      } else {
        precipitation = 'blizzard';
      }
    } else {
      // Rain or clear when above freezing
      if (precipChance < 0.6) {
        precipitation = 'clear';
      } else {
        precipitation = 'rain';
      }
    }

    // Visibility based on precipitation
    let visibility: number;
    switch (precipitation) {
      case 'clear':
        visibility = 8 + Math.random() * 2; // 8-10 miles
        break;
      case 'light-snow':
      case 'rain':
        visibility = 3 + Math.random() * 3; // 3-6 miles
        break;
      case 'heavy-snow':
        visibility = 0.5 + Math.random() * 2; // 0.5-2.5 miles
        break;
      case 'blizzard':
        visibility = 0.1 + Math.random() * 0.4; // 0.1-0.5 miles
        break;
    }
    visibility = Math.round(visibility * 10) / 10; // Round to 1 decimal

    // Determine severity
    let severity: Severity;
    if (precipitation === 'blizzard' || (windSpeed > 50 && visibility < 1)) {
      severity = 'extreme';
    } else if (precipitation === 'heavy-snow' || windSpeed > 40) {
      severity = 'severe';
    } else if (precipitation === 'light-snow' || precipitation === 'rain' || windSpeed > 25) {
      severity = 'moderate';
    } else {
      severity = 'clear';
    }

    // Generate impact description
    const impact = this.generateImpact(precipitation, severity, windSpeed, visibility);

    // Generate forecast
    const forecast = this.generateForecast(precipitation, severity);

    return {
      location,
      temperature,
      windSpeed,
      windDirection,
      visibility,
      precipitation,
      severity,
      impact,
      forecast
    };
  }

  private generateImpact(
    precipitation: WeatherCondition,
    severity: Severity,
    windSpeed: number,
    visibility: number
  ): string {
    switch (severity) {
      case 'extreme':
        return `EXTREME CONDITIONS: Delivery speed reduced by 60%. High risk to sleigh and reindeer. Visibility ${visibility} mi.`;
      case 'severe':
        return `SEVERE CONDITIONS: Delivery speed reduced by 40%. Increased risk to operations. Visibility ${visibility} mi.`;
      case 'moderate':
        return `MODERATE CONDITIONS: Delivery speed reduced by 20%. Exercise caution. Visibility ${visibility} mi.`;
      case 'clear':
        return `OPTIMAL CONDITIONS: No impact on delivery operations. Visibility ${visibility} mi.`;
    }
  }

  private generateForecast(precipitation: WeatherCondition, severity: Severity): string {
    const forecasts = {
      clear: [
        'Conditions expected to remain clear for next 6 hours',
        'Clear skies with good visibility expected',
        'Excellent conditions for delivery operations'
      ],
      moderate: [
        'Conditions may worsen in next 3 hours',
        'Precipitation expected to continue',
        'Slight improvement expected in 4-6 hours'
      ],
      severe: [
        'Severe conditions expected to persist for 2-4 hours',
        'Possible improvement after midnight',
        'Storm system moving through region'
      ],
      extreme: [
        'EXTREME weather expected for next 2 hours - consider route diversion',
        'Blizzard conditions may persist - seek alternate route',
        'Storm expected to clear in 3-4 hours'
      ]
    };

    const forecastList = forecasts[severity];
    return forecastList[Math.floor(Math.random() * forecastList.length)];
  }

  private checkForAlerts() {
    // Generate alerts for severe/extreme weather
    if (this.currentWeather.severity === 'severe' || this.currentWeather.severity === 'extreme') {
      const existingAlert = this.weatherAlerts.find(
        alert => alert.location === this.currentWeather.location && alert.active
      );

      if (!existingAlert) {
        const alert: WeatherAlert = {
          id: `alert-${Date.now()}`,
          location: this.currentWeather.location,
          severity: this.currentWeather.severity,
          type: this.currentWeather.precipitation === 'blizzard' ? 'Blizzard Warning' : 'Weather Advisory',
          description: `${this.currentWeather.severity.toUpperCase()} ${this.currentWeather.precipitation} conditions at ${this.currentWeather.location}`,
          startTime: new Date().toISOString(),
          active: true
        };

        this.weatherAlerts.push(alert);

        logger.warn('Weather alert generated', {
          location: alert.location,
          severity: alert.severity,
          type: alert.type
        });

        // Send alert event to New Relic
        newrelic.recordCustomEvent('WeatherAlert', {
          ...alert,
          windSpeed: this.currentWeather.windSpeed,
          visibility: this.currentWeather.visibility,
          temperature: this.currentWeather.temperature
        });
      }
    } else {
      // Clear alerts for this location if conditions improved
      this.weatherAlerts.forEach(alert => {
        if (alert.location === this.currentWeather.location && alert.active) {
          alert.active = false;
          alert.endTime = new Date().toISOString();
          logger.info('Weather alert cleared', {
            location: alert.location,
            duration: Date.now() - new Date(alert.startTime).getTime()
          });
        }
      });
    }
  }

  private sendToNewRelic() {
    // Record custom event with weather conditions
    newrelic.recordCustomEvent('WeatherConditions', {
      location: this.currentWeather.location,
      temperature: this.currentWeather.temperature,
      windSpeed: this.currentWeather.windSpeed,
      windDirection: this.currentWeather.windDirection,
      visibility: this.currentWeather.visibility,
      precipitation: this.currentWeather.precipitation,
      severity: this.currentWeather.severity,
      impact: this.currentWeather.impact,
      timestamp: new Date().toISOString()
    });

    // Record custom metrics
    newrelic.recordMetric('Custom/Weather/Temperature', this.currentWeather.temperature);
    newrelic.recordMetric('Custom/Weather/WindSpeed', this.currentWeather.windSpeed);
    newrelic.recordMetric('Custom/Weather/Visibility', this.currentWeather.visibility);

    // Record severity as numeric value for trending
    const severityValue = {
      clear: 0,
      moderate: 1,
      severe: 2,
      extreme: 3
    }[this.currentWeather.severity];
    newrelic.recordMetric('Custom/Weather/Severity', severityValue);
  }

  getCurrentWeather(): CurrentWeather {
    return { ...this.currentWeather };
  }

  getForecast(): ForecastData {
    const current = this.currentWeather;

    // Generate forecast by slightly modifying current conditions
    const generateFutureWeather = (hoursAhead: number): CurrentWeather => {
      const tempChange = (Math.random() - 0.5) * 10 * hoursAhead;
      const windChange = (Math.random() - 0.5) * 20 * hoursAhead;

      return {
        ...current,
        temperature: Math.round(current.temperature + tempChange),
        windSpeed: Math.max(0, Math.round(current.windSpeed + windChange)),
        // Conditions might improve over time
        severity: hoursAhead > 3 && current.severity === 'extreme' ? 'severe' :
                  hoursAhead > 4 && current.severity === 'severe' ? 'moderate' : current.severity,
        forecast: `Forecast for +${hoursAhead}h from current conditions`
      };
    };

    return {
      location: current.location,
      nextHour: generateFutureWeather(1),
      next3Hours: generateFutureWeather(3),
      next6Hours: generateFutureWeather(6),
      timestamp: new Date().toISOString()
    };
  }

  getAlerts(): WeatherAlert[] {
    // Return only active alerts
    return this.weatherAlerts.filter(alert => alert.active);
  }

  getAllAlerts(): WeatherAlert[] {
    // Return all alerts (active and resolved)
    return [...this.weatherAlerts];
  }
}
