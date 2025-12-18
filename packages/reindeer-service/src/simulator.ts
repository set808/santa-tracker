import newrelic from 'newrelic';
import { ReindeerStatus, ReindeerName } from 'shared-types';
import { createLogger } from './logger';

const logger = createLogger('reindeer-simulator');

const REINDEER_NAMES: ReindeerName[] = [
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

// Position assignments for the team
const REINDEER_POSITIONS: Record<ReindeerName, 'lead' | 'middle' | 'rear'> = {
  'Dasher': 'lead',
  'Dancer': 'lead',
  'Prancer': 'middle',
  'Vixen': 'middle',
  'Comet': 'middle',
  'Cupid': 'middle',
  'Donner': 'rear',
  'Blitzen': 'rear',
  'Rudolph': 'lead'
};

export class ReindeerSimulator {
  private static instance: ReindeerSimulator;
  private reindeerStatuses: Map<ReindeerName, ReindeerStatus>;
  private intervalId?: NodeJS.Timeout;
  private startTime: Date;
  private isChristmasEve: boolean = false;

  // Track previous values for festive change detection
  private previousStatuses: Map<ReindeerName, {energy: number, status: string, speedContribution: number}> = new Map();
  private energyBoostCount: number = 0;

  private constructor() {
    this.startTime = new Date();
    this.isChristmasEve = this.checkIfChristmasEve();
    this.reindeerStatuses = new Map();

    // Initialize all reindeer
    REINDEER_NAMES.forEach(name => {
      const status: ReindeerStatus = {
        name,
        energy: 50 + Math.random() * 50, // 50-100%
        health: 70 + Math.random() * 30, // 70-100%
        morale: 60 + Math.random() * 40, // 60-100%
        speedContribution: 80 + Math.random() * 20, // 80-100%
        status: 'excellent',
        position: REINDEER_POSITIONS[name]
      };

      this.reindeerStatuses.set(name, status);
    });

    logger.info('Reindeer simulator initialized', {
      totalReindeer: REINDEER_NAMES.length,
      isChristmasEve: this.isChristmasEve,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning'
    });
  }

  static getInstance(): ReindeerSimulator {
    if (!ReindeerSimulator.instance) {
      ReindeerSimulator.instance = new ReindeerSimulator();
    }
    return ReindeerSimulator.instance;
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

    // Update every 3 seconds
    this.intervalId = setInterval(() => {
      this.update();
    }, 3000);

    logger.info('Reindeer simulator started', {
      updateInterval: 3000,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning'
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Reindeer simulator stopped');
    }
  }

  private update() {
    const timeSinceStart = Date.now() - this.startTime.getTime();
    // 10-minute speedrun: 144x multiplier compresses 24 hours into 10 minutes
    const SIMULATION_SPEED_MULTIPLIER = 144;
    const hoursElapsed = (timeSinceStart / (1000 * 60 * 60)) * SIMULATION_SPEED_MULTIPLIER;

    if (!this.isChristmasEve) {
      // Route planning mode - reindeer are resting and recovering
      this.updateRoutePlanning(hoursElapsed);
    } else {
      // Christmas Eve mode - reindeer are working hard
      this.updateChristmasEve(hoursElapsed);
    }

    // Send metrics to New Relic for all reindeer
    this.sendToNewRelic();
  }

  private updateRoutePlanning(hoursElapsed: number) {
    // During route planning, reindeer are training with varying intensity
    const timeInMinutes = hoursElapsed * 60;

    REINDEER_NAMES.forEach((name, index) => {
      const status = this.reindeerStatuses.get(name)!;

      // Each reindeer has slightly different training schedules for variety
      const phaseShift = index * 0.5; // Stagger the patterns

      // Energy oscillates during training sessions (high during rest, lower during exercise)
      const energyWave = Math.sin((timeInMinutes + phaseShift) / 4) * 8; // 4-minute cycles
      const baseEnergy = 85;
      status.energy = Math.max(70, Math.min(100, baseEnergy + energyWave + Math.random() * 4));

      // Health varies with training intensity (oscillating pattern)
      const healthWave1 = Math.sin((timeInMinutes + phaseShift) / 6) * 6; // 6-minute cycle
      const healthWave2 = Math.cos((timeInMinutes + phaseShift) / 3) * 4; // 3-minute cycle
      const baseHealth = 88;
      status.health = Math.max(75, Math.min(100, baseHealth + healthWave1 + healthWave2 + Math.random() * 3));

      // Morale fluctuates with training satisfaction
      const moraleWave = Math.cos((timeInMinutes + phaseShift) / 5) * 7; // 5-minute cycle
      status.morale = Math.max(80, Math.min(100, 90 + moraleWave + Math.random() * 5));

      // Speed contribution varies during training runs
      const speedWave = Math.sin((timeInMinutes + phaseShift) / 4.5) * 4; // 4.5-minute cycle
      status.speedContribution = Math.max(85, Math.min(100, 93 + speedWave + Math.random() * 3));

      // Status based on overall condition
      const avgCondition = (status.energy + status.health + status.morale) / 3;
      status.status = avgCondition > 90 ? 'excellent' :
                      avgCondition > 80 ? 'good' :
                      avgCondition > 70 ? 'tired' : 'resting';

      this.reindeerStatuses.set(name, status);
    });
  }

  private updateChristmasEve(hoursElapsed: number) {
    // Christmas Eve - reindeer work hard and get tired
    REINDEER_NAMES.forEach(name => {
      const status = this.reindeerStatuses.get(name)!;
      const previousStatus = this.previousStatuses.get(name);

      // Energy depletes over time, especially for non-lead reindeer
      const energyDepletion = status.position === 'rear' ? 1.5 : 1.0;
      const baseDrain = (hoursElapsed / 24) * 40 * energyDepletion; // 40% over full journey
      const newEnergy = Math.max(20, 100 - baseDrain + Math.random() * 5);

      // Health degrades slightly with exertion
      const healthDrain = (hoursElapsed / 24) * 15; // 15% over full journey
      const newHealth = Math.max(60, 100 - healthDrain + Math.random() * 3);

      // Morale fluctuates based on progress and conditions
      const moraleBase = 70 - (hoursElapsed / 24) * 20;
      const newMorale = Math.max(40, moraleBase + Math.random() * 20);

      // Speed contribution decreases with fatigue
      const fatigueEffect = (100 - newEnergy) * 0.2; // Energy affects speed
      const newSpeedContribution = Math.max(65, 95 - fatigueEffect + Math.random() * 5);

      // Status based on overall condition
      const avgCondition = (newEnergy + newHealth + newMorale) / 3;
      const newStatus = avgCondition > 85 ? 'excellent' :
                      avgCondition > 70 ? 'good' :
                      avgCondition > 50 ? 'tired' :
                      avgCondition > 35 ? 'exhausted' : 'resting';

      // 🎅 FESTIVE LOGGING - Energy threshold warnings with personalized messages
      const reindeerMessages: Record<string, string> = {
        'Dasher': 'Still dashing but needs a candy cane break soon!',
        'Dancer': 'Not dancing as gracefully as usual!',
        'Prancer': 'Prancing has turned into trotting!',
        'Vixen': 'Feeling a bit less vixen-y than usual!',
        'Comet': 'Moving slower than a comet right now!',
        'Cupid': 'Could use some love and encouragement!',
        'Donner': 'Thunder is getting quieter!',
        'Blitzen': 'Not blitzing as fast as usual!',
        'Rudolph': 'His nose is dimming a bit - time for some carrots!'
      };

      if (previousStatus) {
        // Energy drops crossing thresholds
        if (newEnergy <= 60 && previousStatus.energy > 60) {
          logger.warn(`🦌 ${name} is feeling ${newStatus}! Energy at ${Math.round(newEnergy)}% - ${reindeerMessages[name]}`, {
            reindeerName: name,
            energy: Math.round(newEnergy),
            status: newStatus,
            position: status.position,
            threshold: 60
          });
        } else if (newEnergy <= 40 && previousStatus.energy > 40) {
          logger.warn(`⚠️ ${name} is running on fumes at ${Math.round(newEnergy)}% energy - time for emergency elf support!`, {
            reindeerName: name,
            energy: Math.round(newEnergy),
            status: newStatus,
            position: status.position,
            threshold: 40
          });
        }

        // Status transitions
        if (newStatus !== previousStatus.status && previousStatus.status !== '') {
          const encouragingMessages: Record<string, string> = {
            'excellent': 'Back in top form!',
            'good': 'Holding steady!',
            'tired': 'Needs some encouragement!',
            'exhausted': 'Really needs a break!',
            'resting': 'Taking it easy now.'
          };

          logger.info(`⭐ ${name} went from ${previousStatus.status} to ${newStatus} - ${encouragingMessages[newStatus]}`, {
            reindeerName: name,
            oldStatus: previousStatus.status,
            newStatus,
            energy: Math.round(newEnergy),
            position: status.position
          });
        }

        // Speed contribution significant drop
        if (newSpeedContribution < previousStatus.speedContribution - 10) {
          logger.warn(`🐎 ${name}'s speed contribution dropped to ${Math.round(newSpeedContribution)}% - pulling ${status.position} position is tough work!`, {
            reindeerName: name,
            speedContribution: Math.round(newSpeedContribution),
            previousSpeed: Math.round(previousStatus.speedContribution),
            position: status.position
          });
        }
      }

      // Add some variation to make it interesting
      if (Math.random() < 0.05) {
        // 5% chance of slight energy boost (encouragement from Santa)
        status.energy = Math.min(100, newEnergy + 5);
        status.morale = Math.min(100, newMorale + 10);

        // 🎅 FESTIVE LOGGING - Energy boost
        logger.info(`🎄 Santa gave ${name} some encouraging words! +5% energy and +10% morale - that's the Christmas spirit!`, {
          reindeerName: name,
          energy: Math.round(status.energy),
          morale: Math.round(status.morale)
        });
        this.energyBoostCount++;
      } else {
        status.energy = newEnergy;
        status.morale = newMorale;
      }

      status.health = newHealth;
      status.speedContribution = newSpeedContribution;
      status.status = newStatus;

      // Update tracking for next iteration
      this.previousStatuses.set(name, {
        energy: status.energy,
        status: status.status,
        speedContribution: status.speedContribution
      });

      this.reindeerStatuses.set(name, status);
    });

    // 🎅 FESTIVE LOGGING - Team-level warnings
    const teamStats = this.calculateTeamAverages();
    const exhaustedCount = Array.from(this.reindeerStatuses.values()).filter(s => s.status === 'exhausted').length;

    if (exhaustedCount >= 3) {
      logger.error(`🚨 We have ${exhaustedCount} exhausted reindeer! Santa needs to slow down and let them rest!`, {
        exhaustedCount,
        exhaustedReindeer: Array.from(this.reindeerStatuses.entries())
          .filter(([_, s]) => s.status === 'exhausted')
          .map(([name]) => name),
        teamAverageEnergy: Math.round(teamStats.averageEnergy)
      });
    } else if (teamStats.averageEnergy < 50) {
      logger.warn(`😰 Team average at ${Math.round(teamStats.averageEnergy)}% - the whole crew needs some Christmas cookies!`, {
        teamAverageEnergy: Math.round(teamStats.averageEnergy),
        teamAverageMorale: Math.round(teamStats.averageMorale),
        teamAverageHealth: Math.round(teamStats.averageHealth)
      });
    }
  }

  private sendToNewRelic() {
    // Send individual reindeer events
    this.reindeerStatuses.forEach((status, name) => {
      // Record custom event for each reindeer
      newrelic.recordCustomEvent('ReindeerStatus', {
        name: status.name,
        energy: status.energy,
        health: status.health,
        morale: status.morale,
        speedContribution: status.speedContribution,
        status: status.status,
        position: status.position,
        mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning',
        timestamp: new Date().toISOString()
      });

      // Record custom metrics for each reindeer
      newrelic.recordMetric(`Custom/Reindeer/${name}/Energy`, status.energy);
      newrelic.recordMetric(`Custom/Reindeer/${name}/Health`, status.health);
      newrelic.recordMetric(`Custom/Reindeer/${name}/Morale`, status.morale);
      newrelic.recordMetric(`Custom/Reindeer/${name}/SpeedContribution`, status.speedContribution);
    });

    // Send team-wide metrics
    const teamStats = this.calculateTeamAverages();
    newrelic.recordCustomEvent('ReindeerTeamStatus', {
      ...teamStats,
      mode: this.isChristmasEve ? 'christmas-eve' : 'route-planning',
      timestamp: new Date().toISOString()
    });

    newrelic.recordMetric('Custom/Reindeer/Team/AverageEnergy', teamStats.averageEnergy);
    newrelic.recordMetric('Custom/Reindeer/Team/AverageHealth', teamStats.averageHealth);
    newrelic.recordMetric('Custom/Reindeer/Team/AverageMorale', teamStats.averageMorale);
    newrelic.recordMetric('Custom/Reindeer/Team/AverageSpeedContribution', teamStats.averageSpeedContribution);
  }

  private calculateTeamAverages() {
    let totalEnergy = 0;
    let totalHealth = 0;
    let totalMorale = 0;
    let totalSpeedContribution = 0;
    const count = this.reindeerStatuses.size;

    this.reindeerStatuses.forEach(status => {
      totalEnergy += status.energy;
      totalHealth += status.health;
      totalMorale += status.morale;
      totalSpeedContribution += status.speedContribution;
    });

    return {
      averageEnergy: totalEnergy / count,
      averageHealth: totalHealth / count,
      averageMorale: totalMorale / count,
      averageSpeedContribution: totalSpeedContribution / count,
      totalReindeer: count
    };
  }

  getReindeerStatus(name: ReindeerName): ReindeerStatus | undefined {
    const status = this.reindeerStatuses.get(name);
    return status ? { ...status } : undefined;
  }

  getAllReindeerStatuses(): ReindeerStatus[] {
    return Array.from(this.reindeerStatuses.values()).map(status => ({ ...status }));
  }

  getTeamAverages() {
    return this.calculateTeamAverages();
  }
}
