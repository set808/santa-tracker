import LoadingSpinner from '../UI/LoadingSpinner';
import ProgressBar from '../UI/ProgressBar';
import Tooltip from '../UI/Tooltip';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';
import { workshopCurrentMetricsQuery } from '../../queries/nrql-queries';
import type { WorkshopMetrics } from 'shared-types';

export default function WorkshopPanel() {
  const { data: workshopData, loading, error } = useNewRelicQuery<any>(workshopCurrentMetricsQuery);

  // Transform query results to WorkshopMetrics
  const workshopMetrics: WorkshopMetrics | null = workshopData && workshopData.length > 0
    ? {
        activeElves: workshopData[0].activeElves || 0,
        totalElves: workshopData[0].totalElves || 0,
        productionRate: workshopData[0].productionRate || 0,
        qualityScore: workshopData[0].qualityScore || 0,
        inventoryLevels: {
          toys: workshopData[0].toys || 0,
          wrappingPaper: workshopData[0].wrappingPaper || 0,
          ribbons: workshopData[0].ribbons || 0,
          magicDust: workshopData[0].magicDust || 0,
        },
        shifts: {
          current: workshopData[0].currentShift === 'morning' ? 1 : workshopData[0].currentShift === 'evening' ? 2 : 3,
          total: 3,
          changeover: formatShiftChangeover(workshopData[0].shiftRotationIn || 0),
        },
      }
    : null;

  if (loading || !workshopMetrics) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🏭 Workshop Operations
        </h2>
        <LoadingSpinner />
        <p className="text-center text-gray-300 mt-4 text-sm">
          {error ? `Error loading data: ${error.message}` : 'Loading workshop data...'}
        </p>
      </div>
    );
  }

  function formatShiftChangeover(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
      {/* Header with Tooltip */}
      <div className="mb-4">
        <Tooltip
          content="Real-time monitoring of North Pole Workshop operations. Track elf productivity, production rates, inventory levels, and quality metrics to ensure smooth toy manufacturing."
          nrqlQuery="SELECT count(*) as 'Total Production', average(qualityScore) as 'Avg Quality' FROM WorkshopMetrics SINCE 1 hour ago"
          docsLink="https://docs.newrelic.com/docs/apm/"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 cursor-help">
            🏭 Workshop Operations
            <span className="text-sm text-gray-400">ℹ️</span>
          </h2>
        </Tooltip>
      </div>

      {/* Elf Workforce */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👷</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">
                Elf Workforce
              </h3>
              <p className="text-xs text-gray-400">Active elves on duty</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-newrelic-green">
              {workshopMetrics.activeElves}
            </p>
            <p className="text-xs text-gray-400">
              of {workshopMetrics.totalElves}
            </p>
          </div>
        </div>
        <ProgressBar
          value={workshopMetrics.activeElves}
          max={workshopMetrics.totalElves}
          color="newrelic"
          size="sm"
          showPercentage
        />
      </div>

      {/* Production Rate */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">
                Production Rate
              </h3>
              <p className="text-xs text-gray-400">Toys per minute</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-400">
              {workshopMetrics.productionRate.toFixed(1)}
            </p>
            <p className="text-xs text-gray-400">toys/min</p>
          </div>
        </div>
      </div>

      {/* Quality Score */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase">
                Quality Score
              </h3>
              <p className="text-xs text-gray-400">Production quality</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-christmas-gold">
              {workshopMetrics.qualityScore?.toFixed(1) ?? '0.0'}%
            </p>
          </div>
        </div>
        <ProgressBar
          value={workshopMetrics.qualityScore}
          color="gold"
          size="sm"
        />
      </div>

      {/* Inventory Levels */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3 flex items-center gap-2">
          <span>📦</span> Inventory Levels
        </h3>
        <div className="space-y-3">
          <ProgressBar
            value={workshopMetrics.inventoryLevels.toys}
            label="Toys Ready"
            showPercentage
            color="green"
            size="sm"
          />
          <ProgressBar
            value={workshopMetrics.inventoryLevels.wrappingPaper}
            label="Wrapping Paper"
            showPercentage
            color={workshopMetrics.inventoryLevels.wrappingPaper > 30 ? 'blue' : 'red'}
            size="sm"
          />
          <ProgressBar
            value={workshopMetrics.inventoryLevels.ribbons}
            label="Ribbons"
            showPercentage
            color={workshopMetrics.inventoryLevels.ribbons > 30 ? 'blue' : 'red'}
            size="sm"
          />
          <ProgressBar
            value={workshopMetrics.inventoryLevels.magicDust}
            label="Magic Dust"
            showPercentage
            color={workshopMetrics.inventoryLevels.magicDust > 30 ? 'gold' : 'red'}
            size="sm"
            animated={workshopMetrics.inventoryLevels.magicDust < 30}
          />
        </div>
      </div>

      {/* Shift Information */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3 flex items-center gap-2">
          <span>🕐</span> Shift Schedule
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400">Current Shift</p>
            <p className="text-lg font-bold text-white">
              {workshopMetrics.shifts.current} / {workshopMetrics.shifts.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Next Changeover</p>
            <p className="text-lg font-bold text-newrelic-green">
              {workshopMetrics.shifts.changeover}
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(workshopMetrics.inventoryLevels.magicDust < 30 ||
        workshopMetrics.inventoryLevels.wrappingPaper < 20 ||
        workshopMetrics.inventoryLevels.ribbons < 20) && (
        <div className="mt-4 bg-yellow-500/20 border border-yellow-500 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-400">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-semibold text-sm">Low Inventory Alert</p>
              <p className="text-xs text-gray-300 mt-1">
                Some materials are running low. Resupply recommended.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
