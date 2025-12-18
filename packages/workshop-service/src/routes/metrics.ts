import { Router } from 'express';
import newrelic from 'newrelic';
import { WorkshopSimulator } from '../simulator';

export const metricsRouter = Router();
const simulator = WorkshopSimulator.getInstance();

// Get current workshop metrics
metricsRouter.get('/current', (req, res) => {
  try {
    const metrics = simulator.getMetrics();

    // Add custom attributes to transaction
    newrelic.addCustomAttributes({
      endpoint: 'workshop-metrics',
      productionRate: metrics.productionRate,
      qualityScore: metrics.qualityScore,
      activeElves: metrics.activeElves
    });

    res.json(metrics);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch workshop metrics' });
  }
});

// Get elf statistics by department
metricsRouter.get('/elves', (req, res) => {
  try {
    const departments = simulator.getAllDepartments();
    const totalElves = departments.reduce((sum, d) => sum + d.elfCount, 0);
    const activeElves = departments.reduce((sum, d) => sum + d.activeElves, 0);

    const elfStats = {
      total: totalElves,
      active: activeElves,
      byDepartment: departments.map(d => ({
        department: d.name,
        total: d.elfCount,
        active: d.activeElves,
        productivity: d.productivity,
        morale: d.morale,
        shift: d.currentShift
      }))
    };

    newrelic.addCustomAttributes({
      endpoint: 'elf-stats',
      totalElves,
      activeElves
    });

    res.json(elfStats);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch elf statistics' });
  }
});

// Get department-specific metrics
metricsRouter.get('/department/:name', (req, res) => {
  try {
    const departmentName = req.params.name;
    const department = simulator.getDepartment(departmentName);

    if (!department) {
      return res.status(404).json({ error: `Department '${departmentName}' not found` });
    }

    newrelic.addCustomAttributes({
      endpoint: 'department-metrics',
      department: departmentName,
      productivity: department.productivity,
      morale: department.morale
    });

    res.json(department);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch department metrics' });
  }
});

// Get all departments
metricsRouter.get('/departments', (req, res) => {
  try {
    const departments = simulator.getAllDepartments();

    newrelic.addCustomAttributes({
      endpoint: 'all-departments',
      departmentCount: departments.length
    });

    res.json(departments);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get inventory levels
metricsRouter.get('/inventory', (req, res) => {
  try {
    const inventory = simulator.getInventory();

    newrelic.addCustomAttributes({
      endpoint: 'inventory',
      toys: inventory.toys,
      wrappingPaper: inventory.wrappingPaper,
      ribbons: inventory.ribbons,
      magicDust: inventory.magicDust
    });

    res.json(inventory);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get production rates and statistics
metricsRouter.get('/production', (req, res) => {
  try {
    const productionStats = simulator.getProductionStats();

    newrelic.addCustomAttributes({
      endpoint: 'production-stats',
      currentRate: productionStats.currentRate,
      qualityScore: productionStats.qualityScore
    });

    res.json(productionStats);
  } catch (error: any) {
    newrelic.noticeError(error);
    res.status(500).json({ error: 'Failed to fetch production statistics' });
  }
});
