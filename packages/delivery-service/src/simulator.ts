import newrelic from 'newrelic';
import { createLogger } from './logger';
import type { DeliveryMetrics, RegionalStats } from 'shared-types';

const logger = createLogger('delivery-simulator');

export interface RegionalDeliveryStats {
  region: string;
  giftsDelivered: number;
  countriesInRegion: string[];
  lastUpdate: string;
}

export interface CountryDeliveryStats {
  country: string;
  region: string;
  giftsDelivered: number;
  population: number;
  lastUpdate: string;
}

// Regional configuration with countries
const REGIONS: Record<string, string[]> = {
  'Asia-Pacific': ['Australia', 'New Zealand', 'Papua New Guinea', 'Fiji', 'Solomon Islands'],
  'Asia': ['Japan', 'South Korea', 'China', 'India', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Singapore', 'Malaysia'],
  'Middle East': ['UAE', 'Saudi Arabia', 'Israel', 'Turkey', 'Iran', 'Jordan', 'Lebanon', 'Kuwait', 'Qatar', 'Oman'],
  'Africa': ['South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Morocco', 'Ethiopia', 'Ghana', 'Tanzania', 'Uganda', 'Algeria'],
  'Europe': ['UK', 'France', 'Germany', 'Italy', 'Spain', 'Poland', 'Romania', 'Netherlands', 'Belgium', 'Greece', 'Portugal', 'Sweden', 'Norway', 'Finland', 'Denmark', 'Iceland'],
  'South America': ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile', 'Venezuela', 'Ecuador', 'Bolivia', 'Paraguay', 'Uruguay'],
  'North America': ['USA', 'Canada', 'Mexico', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Nicaragua', 'El Salvador']
};

// Population estimates for delivery calculations (simplified)
const COUNTRY_POPULATIONS: Record<string, number> = {
  'China': 1400000000, 'India': 1380000000, 'USA': 331000000, 'Indonesia': 273000000,
  'Brazil': 212000000, 'Nigeria': 206000000, 'Japan': 126000000, 'Mexico': 128000000,
  'Russia': 145000000, 'Germany': 83000000, 'UK': 67000000, 'France': 65000000,
  // Add more countries with estimated populations
};

export class DeliverySimulator {
  private static instance: DeliverySimulator;
  private totalGiftsDelivered: number = 0;
  private regionalStats: Map<string, RegionalDeliveryStats> = new Map();
  private countryStats: Map<string, CountryDeliveryStats> = new Map();
  private deliveryRate: number = 0;
  private currentRegionIndex: number = 0;
  private regionOrder: string[];
  private intervalId?: NodeJS.Timeout;
  private startTime: Date;
  private isChristmasEve: boolean = false;

  // Track milestones for festive logging
  private milestonesLogged: Set<number> = new Set();
  private previousRegionIndex: number = 0;
  private previousDeliveryRate: number = 0;

  private constructor() {
    this.startTime = new Date();
    this.isChristmasEve = this.checkIfChristmasEve();
    this.regionOrder = Object.keys(REGIONS);

    // Initialize regional and country stats
    this.initializeStats();

    logger.info('Delivery simulator initialized', {
      isChristmasEve: this.isChristmasEve,
      totalRegions: this.regionOrder.length,
      mode: this.isChristmasEve ? 'christmas-eve' : 'planning'
    });
  }

  static getInstance(): DeliverySimulator {
    if (!DeliverySimulator.instance) {
      DeliverySimulator.instance = new DeliverySimulator();
    }
    return DeliverySimulator.instance;
  }

  private checkIfChristmasEve(): boolean {
    // Always return true - this is Santa's practice run for Christmas Eve!
    return true;
  }

  private initializeStats() {
    // Initialize regional stats
    for (const [region, countries] of Object.entries(REGIONS)) {
      this.regionalStats.set(region, {
        region,
        giftsDelivered: 0,
        countriesInRegion: countries,
        lastUpdate: new Date().toISOString()
      });

      // Initialize country stats
      for (const country of countries) {
        this.countryStats.set(country, {
          country,
          region,
          giftsDelivered: 0,
          population: COUNTRY_POPULATIONS[country] || 10000000, // Default 10M if not specified
          lastUpdate: new Date().toISOString()
        });
      }
    }
  }

  start() {
    if (this.intervalId) {
      logger.warn('Simulator already running');
      return;
    }

    // Update every 2 seconds on Christmas Eve, 5 seconds during planning
    const updateInterval = this.isChristmasEve ? 2000 : 5000;

    this.intervalId = setInterval(() => {
      this.update();
    }, updateInterval);

    logger.info('Delivery simulator started', {
      updateInterval,
      mode: this.isChristmasEve ? 'christmas-eve' : 'planning'
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Delivery simulator stopped');
    }
  }

  private update() {
    const timeSinceStart = Date.now() - this.startTime.getTime();
    // 10-minute speedrun: 144x multiplier compresses 24 hours into 10 minutes
    const SIMULATION_SPEED_MULTIPLIER = 144;
    const hoursElapsed = (timeSinceStart / (1000 * 60 * 60)) * SIMULATION_SPEED_MULTIPLIER;

    if (!this.isChristmasEve) {
      // Planning mode - simulate projections
      this.updatePlanning(hoursElapsed);
    } else {
      // Christmas Eve mode - actual delivery tracking
      this.updateChristmasEve(hoursElapsed);
    }

    // Send metrics to New Relic
    this.sendToNewRelic();
  }

  private updatePlanning(hoursElapsed: number) {
    // In planning mode, simulate delivery projections
    // Slowly increment numbers to show planning simulations
    const baseRate = 1000; // Much slower during planning
    this.deliveryRate = baseRate + Math.random() * 500;

    // Add small increments to simulate planning
    const increment = Math.floor(this.deliveryRate * 5); // 5 second intervals
    this.totalGiftsDelivered += increment;

    // Distribute across regions evenly during planning
    const currentRegion = this.regionOrder[this.currentRegionIndex % this.regionOrder.length];
    const regionalStat = this.regionalStats.get(currentRegion);

    if (regionalStat) {
      regionalStat.giftsDelivered += increment;
      regionalStat.lastUpdate = new Date().toISOString();

      // Distribute to countries in region
      const countriesInRegion = regionalStat.countriesInRegion;
      const perCountry = Math.floor(increment / countriesInRegion.length);

      for (const country of countriesInRegion) {
        const countryStat = this.countryStats.get(country);
        if (countryStat) {
          countryStat.giftsDelivered += perCountry;
          countryStat.lastUpdate = new Date().toISOString();
        }
      }
    }

    // Rotate through regions slowly
    if (hoursElapsed % 1 < 0.001) {
      this.currentRegionIndex = (this.currentRegionIndex + 1) % this.regionOrder.length;
    }
  }

  private updateChristmasEve(hoursElapsed: number) {
    // Christmas Eve mode - BILLIONS of gifts delivered!
    // Aggressive scaling to hit 5B gifts in 24 simulated hours (10 real minutes)
    // Using empirically tuned formula: need ~500M gifts/minute average
    const baseRatePerHour = 2000000000 + (hoursElapsed * 7000000000); // Start at 2B/hour, accelerate to 170B/hour
    this.deliveryRate = Math.floor(baseRatePerHour / 1800); // Convert to per 2-second rate

    // Add variance for realism
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
    const actualDeliveryRate = Math.floor(this.deliveryRate * variance);

    // Calculate increment for this update cycle (2 seconds)
    const increment = actualDeliveryRate * 2; // 2 second intervals
    this.totalGiftsDelivered += increment;

    // 🎅 FESTIVE LOGGING - Delivery milestones
    const milestones = [
      { value: 1000000, message: '🎁 ONE MILLION gifts delivered! The elves are cheering at the North Pole!' },
      { value: 10000000, message: '🌟 10 MILLION gifts! Santa\'s on fire (not literally)!' },
      { value: 50000000, message: '🎉 FIFTY MILLION presents delivered! Children around the world are getting happier by the second!' },
      { value: 100000000, message: '🎊 ONE HUNDRED MILLION! Santa\'s the ultimate delivery service!' },
      { value: 200000000, message: '🚀 200 MILLION! Unstoppable Christmas magic!' },
      { value: 500000000, message: '⭐ HALF A BILLION GIFTS! This is legendary!' },
      { value: 1000000000, message: '🌍 ONE BILLION GIFTS! Santa has delivered to 1 in 5 people on Earth!' },
      { value: 2000000000, message: '🎄 TWO BILLION! Almost half the world has their presents!' },
      { value: 3000000000, message: '✨ THREE BILLION! The majority of the world is covered!' },
      { value: 4000000000, message: '🎅 FOUR BILLION! Only 1 billion to go - Santa\'s in the home stretch!' },
      { value: 5000000000, message: '🎉🎊🎁 FIVE BILLION GIFTS! 100% COMPLETE! Every child on Earth has their presents! MERRY CHRISTMAS! 🎄✨🎅' }
    ];

    for (const milestone of milestones) {
      if (this.totalGiftsDelivered >= milestone.value && !this.milestonesLogged.has(milestone.value)) {
        logger.info(milestone.message, {
          totalGiftsDelivered: this.totalGiftsDelivered,
          milestone: milestone.value,
          deliveryRate: this.deliveryRate
        });
        this.milestonesLogged.add(milestone.value);
      }
    }

    // 🎅 FESTIVE LOGGING - Delivery rate changes
    const rateChange = ((this.deliveryRate - this.previousDeliveryRate) / Math.max(this.previousDeliveryRate, 1)) * 100;
    if (Math.abs(rateChange) > 15 && this.previousDeliveryRate > 0) {
      if (rateChange > 0) {
        logger.info(`🚀 Delivery rate jumped to ${this.deliveryRate.toLocaleString()} gifts/sec! Santa found the turbo boost!`, {
          deliveryRate: this.deliveryRate,
          previousRate: this.previousDeliveryRate,
          changePercent: Math.round(rateChange)
        });
      } else {
        logger.warn(`⏰ Slowing down to ${this.deliveryRate.toLocaleString()} gifts/sec - checking for weather or incidents!`, {
          deliveryRate: this.deliveryRate,
          previousRate: this.previousDeliveryRate,
          changePercent: Math.round(rateChange)
        });
      }
    }
    this.previousDeliveryRate = this.deliveryRate;

    // Determine current region based on completion, with time-based fallback
    // Check if current region is complete and advance if needed
    let currentRegion = this.regionOrder[this.currentRegionIndex];
    let currentRegionStat = this.regionalStats.get(currentRegion);

    // Calculate region's total population
    if (currentRegionStat) {
      const totalPopulation = currentRegionStat.countriesInRegion.reduce((sum, country) => {
        const countryStat = this.countryStats.get(country);
        return sum + (countryStat?.population || 0);
      }, 0);

      // If current region is at 100%, move to next region
      if (currentRegionStat.giftsDelivered >= totalPopulation && this.currentRegionIndex < this.regionOrder.length - 1) {
        this.currentRegionIndex++;
        currentRegion = this.regionOrder[this.currentRegionIndex];
      }
    }

    // Time-based fallback to ensure we don't get stuck on last region
    const regionProgress = (hoursElapsed / 24) * this.regionOrder.length;
    const timeBasedIndex = Math.floor(regionProgress) % this.regionOrder.length;
    if (timeBasedIndex > this.currentRegionIndex) {
      this.currentRegionIndex = timeBasedIndex;
      currentRegion = this.regionOrder[this.currentRegionIndex];
    }

    // 🎅 FESTIVE LOGGING - Region transitions
    if (this.currentRegionIndex !== this.previousRegionIndex && this.previousRegionIndex >= 0) {
      const previousRegion = this.regionOrder[this.previousRegionIndex];
      const previousRegionStat = this.regionalStats.get(previousRegion);

      if (previousRegionStat) {
        logger.info(`✅ ${previousRegion} complete! ${previousRegionStat.giftsDelivered.toLocaleString()} gifts delivered - on to the next adventure!`, {
          region: previousRegion,
          giftsDelivered: previousRegionStat.giftsDelivered,
          nextRegion: currentRegion
        });
      }

      const currentRegionStat = this.regionalStats.get(currentRegion);
      const childrenWaiting = currentRegionStat?.countriesInRegion.length || 0;
      logger.info(`🌏 Welcome to ${currentRegion}! ${childrenWaiting} countries are waiting for Santa!`, {
        region: currentRegion,
        countriesInRegion: childrenWaiting
      });

      this.previousRegionIndex = this.currentRegionIndex;
    }

    // Santa can only be in one place at a time - deliver only to current region
    const regionalStat = this.regionalStats.get(currentRegion);

    if (regionalStat) {
      // Calculate total population for this region
      const countriesInRegion = regionalStat.countriesInRegion;
      const totalPopulation = countriesInRegion.reduce((sum, country) => {
        const countryStat = this.countryStats.get(country);
        return sum + (countryStat?.population || 0);
      }, 0);

      // Calculate how many gifts this region can still receive
      const remainingCapacity = Math.max(0, totalPopulation - regionalStat.giftsDelivered);
      const actualRegionalIncrement = Math.min(increment, remainingCapacity);

      // Only add gifts if region hasn't reached 100%
      if (actualRegionalIncrement > 0) {
        regionalStat.giftsDelivered += actualRegionalIncrement;
        regionalStat.lastUpdate = new Date().toISOString();

        // Distribute to countries in region based on population
        for (const country of countriesInRegion) {
          const countryStat = this.countryStats.get(country);
          if (countryStat && totalPopulation > 0) {
            const countryWeight = countryStat.population / totalPopulation;
            const countryIncrement = Math.floor(actualRegionalIncrement * countryWeight);

            // Cap country deliveries at population
            const countryRemaining = Math.max(0, countryStat.population - countryStat.giftsDelivered);
            const actualCountryIncrement = Math.min(countryIncrement, countryRemaining);

            countryStat.giftsDelivered += actualCountryIncrement;
            countryStat.lastUpdate = new Date().toISOString();
          }
        }
      }
    }
  }

  private sendToNewRelic() {
    const currentRegion = this.regionOrder[this.currentRegionIndex];

    // Record custom event with delivery metrics
    newrelic.recordCustomEvent('GiftDelivery', {
      totalGiftsDelivered: this.totalGiftsDelivered,
      deliveryRate: this.deliveryRate,
      currentRegion,
      mode: this.isChristmasEve ? 'christmas-eve' : 'planning',
      timestamp: new Date().toISOString()
    });

    // Record custom metrics
    newrelic.recordMetric('Custom/Delivery/TotalGifts', this.totalGiftsDelivered);
    newrelic.recordMetric('Custom/Delivery/Rate', this.deliveryRate);

    // Record regional metrics
    for (const [region, stats] of this.regionalStats.entries()) {
      newrelic.recordMetric(`Custom/Delivery/Region/${region}`, stats.giftsDelivered);
    }

    // Log high-value country deliveries
    for (const [country, stats] of this.countryStats.entries()) {
      if (stats.giftsDelivered > 0) {
        newrelic.recordMetric(`Custom/Delivery/Country/${country}`, stats.giftsDelivered);
      }
    }
  }

  getMetrics(): DeliveryMetrics {
    // Calculate total world population for gifts remaining
    const totalWorldPopulation = Array.from(this.countryStats.values())
      .reduce((sum, country) => sum + country.population, 0);

    // Calculate countries visited (countries with at least 1 gift delivered)
    const countriesVisited = Array.from(this.countryStats.values())
      .filter(country => country.giftsDelivered > 0)
      .length;

    // Total countries is the count of all countries
    const totalCountries = this.countryStats.size;

    // Build regional breakdown array
    const regionalBreakdown: RegionalStats[] = Array.from(this.regionalStats.values()).map(region => {
      // Get all countries in this region
      const countriesInRegion = region.countriesInRegion;

      // Calculate total gifts needed for this region (sum of all country populations)
      const totalGiftsForRegion = countriesInRegion.reduce((sum, countryName) => {
        const countryStat = this.countryStats.get(countryName);
        return sum + (countryStat?.population || 0);
      }, 0);

      // Calculate percent complete
      const percentComplete = totalGiftsForRegion > 0
        ? (region.giftsDelivered / totalGiftsForRegion) * 100
        : 0;

      // Calculate average delivery time (simulate based on gifts delivered)
      // More gifts = slightly longer average time
      const averageDeliveryTime = region.giftsDelivered > 0
        ? 0.5 + (Math.log10(region.giftsDelivered + 1) * 0.1)
        : 0.5;

      return {
        region: region.region,
        countries: countriesInRegion,
        giftsDelivered: region.giftsDelivered,
        totalGifts: totalGiftsForRegion,
        percentComplete,
        averageDeliveryTime
      };
    });

    return {
      totalGiftsDelivered: this.totalGiftsDelivered,
      totalGiftsRemaining: Math.max(0, totalWorldPopulation - this.totalGiftsDelivered),
      deliveryRate: this.deliveryRate,
      countriesVisited,
      totalCountries,
      currentRegion: this.regionOrder[this.currentRegionIndex],
      regionalBreakdown
    };
  }

  getRegionalStats(): RegionalDeliveryStats[] {
    return Array.from(this.regionalStats.values());
  }

  getCountryStats(): CountryDeliveryStats[] {
    return Array.from(this.countryStats.values()).sort((a, b) =>
      b.giftsDelivered - a.giftsDelivered
    );
  }

  getRateMetrics() {
    const now = Date.now();
    const timeSinceStart = (now - this.startTime.getTime()) / 1000; // seconds

    return {
      currentRate: this.deliveryRate, // gifts per second
      averageRate: timeSinceStart > 0 ? Math.floor(this.totalGiftsDelivered / timeSinceStart) : 0,
      peakRate: this.deliveryRate, // Could track actual peak
      timestamp: new Date().toISOString()
    };
  }
}
