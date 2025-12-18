import newrelic from 'newrelic';
import { createLogger } from './logger';

const logger = createLogger('workshop-simulator');

interface DepartmentStats {
  name: string;
  elfCount: number;
  currentShift: 'morning' | 'evening' | 'night';
  productivity: number; // 0-100%
  morale: number; // 0-100%
  activeElves: number;
  toysProduced: number;
  defectRate: number; // 0-5%
}

interface InventoryLevels {
  toys: number;
  wrappingPaper: number;
  ribbons: number;
  magicDust: number;
}

interface WorkshopMetrics {
  totalElves: number;
  activeElves: number;
  productionRate: number; // toys per minute
  qualityScore: number; // 0-100%
  inventory: InventoryLevels;
  currentShift: 'morning' | 'evening' | 'night';
  shiftRotationIn: number; // minutes until next rotation
  departments: DepartmentStats[];
  timestamp: string;
}

export class WorkshopSimulator {
  private static instance: WorkshopSimulator;
  private metrics: WorkshopMetrics;
  private intervalId?: NodeJS.Timeout;
  private startTime: Date;
  private shiftStartTime: Date;
  private readonly TOTAL_ELVES = 500;
  private readonly SHIFT_DURATION_HOURS = 8;
  private readonly UPDATE_INTERVAL_MS = 4000;

  private departments: DepartmentStats[] = [
    {
      name: 'manufacturing',
      elfCount: 200,
      currentShift: 'morning',
      productivity: 95,
      morale: 88,
      activeElves: 200,
      toysProduced: 0,
      defectRate: 1.2
    },
    {
      name: 'quality-control',
      elfCount: 100,
      currentShift: 'morning',
      productivity: 92,
      morale: 85,
      activeElves: 100,
      toysProduced: 0,
      defectRate: 0.5
    },
    {
      name: 'wrapping',
      elfCount: 125,
      currentShift: 'morning',
      productivity: 90,
      morale: 90,
      activeElves: 125,
      toysProduced: 0,
      defectRate: 0.8
    },
    {
      name: 'logistics',
      elfCount: 75,
      currentShift: 'morning',
      productivity: 93,
      morale: 87,
      activeElves: 75,
      toysProduced: 0,
      defectRate: 0.3
    }
  ];

  private constructor() {
    this.startTime = new Date();
    this.shiftStartTime = new Date();

    this.metrics = {
      totalElves: this.TOTAL_ELVES,
      activeElves: this.TOTAL_ELVES,
      productionRate: 10000,
      qualityScore: 96.5,
      inventory: {
        toys: 3000000,
        wrappingPaper: 1250000,
        ribbons: 650000,
        magicDust: 30000
      },
      currentShift: 'morning',
      shiftRotationIn: this.SHIFT_DURATION_HOURS * 60,
      departments: this.departments,
      timestamp: new Date().toISOString()
    };

    logger.info('Workshop simulator initialized', {
      totalElves: this.TOTAL_ELVES,
      departments: this.departments.length,
      initialProductionRate: this.metrics.productionRate
    });
  }

  static getInstance(): WorkshopSimulator {
    if (!WorkshopSimulator.instance) {
      WorkshopSimulator.instance = new WorkshopSimulator();
    }
    return WorkshopSimulator.instance;
  }

  start() {
    if (this.intervalId) {
      logger.warn('Simulator already running');
      return;
    }

    this.intervalId = setInterval(() => {
      this.update();
    }, this.UPDATE_INTERVAL_MS);

    logger.info('Workshop simulator started', {
      updateInterval: this.UPDATE_INTERVAL_MS
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Workshop simulator stopped');
    }
  }

  private update() {
    const now = new Date();
    const timeSinceStart = now.getTime() - this.startTime.getTime();
    // 10-minute speedrun: 144x multiplier compresses 24 hours into 10 minutes
    const SIMULATION_SPEED_MULTIPLIER = 144;
    const timeSinceShift = (now.getTime() - this.shiftStartTime.getTime()) * SIMULATION_SPEED_MULTIPLIER;
    const minutesSinceShift = timeSinceShift / (1000 * 60);
    const shiftRotationIn = (this.SHIFT_DURATION_HOURS * 60) - minutesSinceShift;

    // Check if we need to rotate shifts
    if (shiftRotationIn <= 0) {
      this.rotateShift();
    }

    // Update each department
    let totalProduction = 0;
    let totalActiveElves = 0;
    let totalQuality = 0;

    this.departments.forEach(dept => {
      this.updateDepartment(dept, minutesSinceShift);
      totalActiveElves += dept.activeElves;
      totalQuality += dept.productivity * (100 - dept.defectRate);
    });

    // Calculate overall production rate (toys per minute)
    const baseProductionRate = 10000;
    const avgProductivity = this.departments.reduce((sum, d) => sum + d.productivity, 0) / this.departments.length;
    const avgMorale = this.departments.reduce((sum, d) => sum + d.morale, 0) / this.departments.length;
    const efficiencyMultiplier = (avgProductivity / 100) * (avgMorale / 100);
    const productionRate = Math.floor(baseProductionRate * efficiencyMultiplier * (0.5 + Math.random()));

    // Production rate varies (5000-15000 toys/minute)
    const clampedProductionRate = Math.max(5000, Math.min(15000, productionRate));

    // Calculate quality score (92-99%)
    const qualityScore = 92 + (avgProductivity / 100) * 7 + Math.random() * 2;

    // Update inventory - toys increase, materials decrease
    const toysProducedThisCycle = (clampedProductionRate * this.UPDATE_INTERVAL_MS) / 60000;
    this.metrics.inventory.toys = Math.min(5000000, this.metrics.inventory.toys + toysProducedThisCycle);

    // Consume materials based on production
    const materialsUsedMultiplier = toysProducedThisCycle / 10000;
    this.metrics.inventory.wrappingPaper = Math.max(500000, this.metrics.inventory.wrappingPaper - (50 * materialsUsedMultiplier));
    this.metrics.inventory.ribbons = Math.max(300000, this.metrics.inventory.ribbons - (30 * materialsUsedMultiplier));
    this.metrics.inventory.magicDust = Math.max(10000, this.metrics.inventory.magicDust - (5 * materialsUsedMultiplier));

    // Occasionally replenish materials (simulating deliveries)
    if (Math.random() < 0.05) {
      this.replenishMaterials();
    }

    this.metrics = {
      totalElves: this.TOTAL_ELVES,
      activeElves: totalActiveElves,
      productionRate: clampedProductionRate,
      qualityScore: Math.min(99, qualityScore),
      inventory: this.metrics.inventory,
      currentShift: this.departments[0].currentShift,
      shiftRotationIn: Math.max(0, shiftRotationIn),
      departments: this.departments,
      timestamp: now.toISOString()
    };

    this.sendToNewRelic();
  }

  private updateDepartment(dept: DepartmentStats, minutesSinceShift: number) {
    // Productivity varies through the shift (fatigue curve)
    const shiftProgress = minutesSinceShift / (this.SHIFT_DURATION_HOURS * 60);
    const fatigueEffect = 1 - (shiftProgress * 0.15); // Up to 15% reduction
    const baseProductivity = 85 + Math.random() * 10;
    dept.productivity = Math.min(99, baseProductivity * fatigueEffect);

    // Morale fluctuates
    dept.morale = Math.max(70, Math.min(95, dept.morale + (Math.random() - 0.5) * 3));

    // Active elves varies slightly (breaks, meetings, etc.)
    const activePercentage = 0.85 + Math.random() * 0.15;
    dept.activeElves = Math.floor(dept.elfCount * activePercentage);

    // Track production for manufacturing department
    if (dept.name === 'manufacturing') {
      dept.toysProduced += Math.floor(dept.productivity * 2 * Math.random());
    }

    // Defect rate inversely related to productivity and morale
    const qualityFactor = (dept.productivity + dept.morale) / 200;
    dept.defectRate = Math.max(0.2, Math.min(5, (1 - qualityFactor) * 5));
  }

  private rotateShift() {
    const shifts: Array<'morning' | 'evening' | 'night'> = ['morning', 'evening', 'night'];
    const currentShiftIndex = shifts.indexOf(this.departments[0].currentShift);
    const nextShift = shifts[(currentShiftIndex + 1) % 3];

    logger.info('Rotating shift', {
      from: this.departments[0].currentShift,
      to: nextShift
    });

    // Update all departments to new shift
    this.departments.forEach(dept => {
      dept.currentShift = nextShift;

      // Reset morale and productivity for new shift
      dept.morale = 85 + Math.random() * 10;
      dept.productivity = 90 + Math.random() * 8;

      // Night shift typically has fewer elves
      if (nextShift === 'night') {
        dept.activeElves = Math.floor(dept.elfCount * 0.7);
      } else {
        dept.activeElves = Math.floor(dept.elfCount * 0.95);
      }
    });

    this.shiftStartTime = new Date();

    // Record shift change event
    newrelic.recordCustomEvent('ShiftRotation', {
      shift: nextShift,
      totalElves: this.TOTAL_ELVES,
      activeElves: this.departments.reduce((sum, d) => sum + d.activeElves, 0),
      timestamp: new Date().toISOString()
    });
  }

  private replenishMaterials() {
    const replenishAmount = {
      wrappingPaper: 100000 + Math.random() * 50000,
      ribbons: 50000 + Math.random() * 30000,
      magicDust: 5000 + Math.random() * 5000
    };

    this.metrics.inventory.wrappingPaper = Math.min(2000000,
      this.metrics.inventory.wrappingPaper + replenishAmount.wrappingPaper);
    this.metrics.inventory.ribbons = Math.min(1000000,
      this.metrics.inventory.ribbons + replenishAmount.ribbons);
    this.metrics.inventory.magicDust = Math.min(50000,
      this.metrics.inventory.magicDust + replenishAmount.magicDust);

    logger.info('Materials replenished', replenishAmount);

    newrelic.recordCustomEvent('MaterialsReplenished', {
      ...replenishAmount,
      timestamp: new Date().toISOString()
    });
  }

  private sendToNewRelic() {
    // Record workshop metrics event
    newrelic.recordCustomEvent('WorkshopMetrics', {
      totalElves: this.metrics.totalElves,
      activeElves: this.metrics.activeElves,
      productionRate: this.metrics.productionRate,
      qualityScore: this.metrics.qualityScore,
      currentShift: this.metrics.currentShift,
      shiftRotationIn: this.metrics.shiftRotationIn,
      toyInventory: this.metrics.inventory.toys,
      wrappingPaperInventory: this.metrics.inventory.wrappingPaper,
      ribbonsInventory: this.metrics.inventory.ribbons,
      magicDustInventory: this.metrics.inventory.magicDust,
      timestamp: this.metrics.timestamp
    });

    // Record per-department production events
    this.departments.forEach(dept => {
      newrelic.recordCustomEvent('ElfProduction', {
        department: dept.name,
        elfCount: dept.elfCount,
        activeElves: dept.activeElves,
        productivity: dept.productivity,
        morale: dept.morale,
        defectRate: dept.defectRate,
        shift: dept.currentShift,
        toysProduced: dept.toysProduced,
        timestamp: this.metrics.timestamp
      });
    });

    // Record custom metrics for dashboards
    newrelic.recordMetric('Custom/Workshop/ProductionRate', this.metrics.productionRate);
    newrelic.recordMetric('Custom/Workshop/QualityScore', this.metrics.qualityScore);
    newrelic.recordMetric('Custom/Workshop/ActiveElves', this.metrics.activeElves);
    newrelic.recordMetric('Custom/Workshop/ToyInventory', this.metrics.inventory.toys);
    newrelic.recordMetric('Custom/Workshop/WrappingPaper', this.metrics.inventory.wrappingPaper);
    newrelic.recordMetric('Custom/Workshop/Ribbons', this.metrics.inventory.ribbons);
    newrelic.recordMetric('Custom/Workshop/MagicDust', this.metrics.inventory.magicDust);

    // Department-specific metrics
    this.departments.forEach(dept => {
      newrelic.recordMetric(`Custom/Workshop/Department/${dept.name}/Productivity`, dept.productivity);
      newrelic.recordMetric(`Custom/Workshop/Department/${dept.name}/Morale`, dept.morale);
      newrelic.recordMetric(`Custom/Workshop/Department/${dept.name}/DefectRate`, dept.defectRate);
    });
  }

  getMetrics(): WorkshopMetrics {
    return { ...this.metrics };
  }

  getDepartment(name: string): DepartmentStats | undefined {
    return this.departments.find(d => d.name === name);
  }

  getAllDepartments(): DepartmentStats[] {
    return [...this.departments];
  }

  getInventory(): InventoryLevels {
    return { ...this.metrics.inventory };
  }

  getProductionStats() {
    const totalProduction = this.departments.reduce((sum, d) => sum + d.toysProduced, 0);
    const avgProductivity = this.departments.reduce((sum, d) => sum + d.productivity, 0) / this.departments.length;
    const avgMorale = this.departments.reduce((sum, d) => sum + d.morale, 0) / this.departments.length;

    return {
      totalProduction,
      currentRate: this.metrics.productionRate,
      qualityScore: this.metrics.qualityScore,
      avgProductivity,
      avgMorale
    };
  }
}
