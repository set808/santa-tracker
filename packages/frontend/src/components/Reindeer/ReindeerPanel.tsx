import ReindeerCard from './ReindeerCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import Tooltip from '../UI/Tooltip';
import { ChartCard } from '../Charts';
import { reindeerEnergyTrendQuery, reindeerSpeedContributionQuery, reindeerIndividualQuery } from '../../queries/nrql-queries';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';
import type { ReindeerStatus } from 'shared-types';

export default function ReindeerPanel() {
  const { data: reindeerData, loading, error } = useNewRelicQuery<any>(reindeerIndividualQuery);

  // Transform FACET query results to ReindeerStatus array
  const reindeerStatus: ReindeerStatus[] = reindeerData && Array.isArray(reindeerData)
    ? reindeerData.map((item: any, index: number) => ({
        name: item.name || item.facet,
        energy: item.energy || 0,
        health: item.health || 0,
        morale: item.morale || 0,
        speedContribution: item.speedContribution || 0,
        status: item.status || 'resting',
        position: index === 0 ? 'lead' : index < 4 ? 'middle' : 'rear',
        specialAbility: (item.name || item.facet) === 'Rudolph' ? 'Glowing red nose' : undefined,
      }))
    : [];

  if (loading || reindeerStatus.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🦌 Reindeer Status
        </h2>
        <LoadingSpinner />
        <p className="text-center text-gray-300 mt-4 text-sm">
          {error ? `Error loading data: ${error.message}` : 'Loading reindeer telemetry...'}
        </p>
      </div>
    );
  }

  // Calculate team averages
  const teamAverages = {
    energy: Math.round(
      reindeerStatus.reduce((sum, r) => sum + r.energy, 0) / reindeerStatus.length
    ),
    health: Math.round(
      reindeerStatus.reduce((sum, r) => sum + r.health, 0) / reindeerStatus.length
    ),
    morale: Math.round(
      reindeerStatus.reduce((sum, r) => sum + r.morale, 0) / reindeerStatus.length
    ),
  };

  // Count reindeer by status
  const statusCounts = reindeerStatus.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
      {/* Header with Tooltip */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🦌 Reindeer Status
          </h2>
          <p className="text-xs text-gray-400 mt-1">Team health monitoring</p>
        </div>
        <Tooltip
          content="Real-time monitoring of all 9 reindeer vital signs including energy levels, health metrics, and morale. Each reindeer's performance directly impacts sleigh speed and maneuverability."
          nrqlQuery="SELECT average(energy), average(health), average(morale) FROM ReindeerMetrics FACET name SINCE 1 hour ago"
          docsLink="https://docs.newrelic.com/docs/apm/"
        >
          <span className="text-lg cursor-help hover:scale-110 transition-transform">ℹ️</span>
        </Tooltip>
      </div>

      {/* Team Summary */}
      <div className="bg-gradient-to-br from-christmas-red/10 to-christmas-green/10 rounded-xl p-6 mb-6 border-2 border-christmas-gold/30 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">
          Team Averages
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-newrelic-green">
              {teamAverages.energy}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Energy</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">
              {teamAverages.health}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Health</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {teamAverages.morale}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Morale</p>
          </div>
        </div>

        {/* Status distribution */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2 text-xs">
          {Object.entries(statusCounts).map(([status, count]) => (
            <span
              key={status}
              className="px-2 py-1 bg-white/10 rounded-full text-gray-300"
            >
              {count} {status}
            </span>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Energy Trend Chart */}
        <ChartCard
          title="Energy Levels Over Time"
          icon="⚡"
          queryConfig={reindeerEnergyTrendQuery}
          chartType="line"
          color="green"
          tooltip="Energy levels for each reindeer over the last 30 minutes"
          chartProps={{
            dataKeys: ['Dasher', 'Dancer', 'Prancer', 'Vixen', 'Comet', 'Cupid', 'Donner', 'Blitzen', 'Rudolph'],
            height: 300,
            formatYAxis: (value) => `${value}%`,
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data)) return [];

            // Group by timestamp, create data points with all reindeer
            const timeMap = new Map<number, any>();

            data.forEach((item: any) => {
              const timestamp = item.beginTimeSeconds * 1000 || item.timestamp;
              const name = item.facet || item.name;
              const energy = item['average.energy'] || item.average || item.energy || 0;

              if (!timeMap.has(timestamp)) {
                timeMap.set(timestamp, { timestamp });
              }

              const point = timeMap.get(timestamp);
              if (name && point) {
                point[name] = energy;
              }
            });

            return Array.from(timeMap.values()).sort((a, b) => a.timestamp - b.timestamp);
          }}
        />

        {/* Speed Contribution Bar Chart */}
        <ChartCard
          title="Speed Contribution"
          icon="🚀"
          queryConfig={reindeerSpeedContributionQuery}
          chartType="bar"
          color="blue"
          tooltip="Each reindeer's contribution to overall sleigh speed"
          chartProps={{
            xKey: 'name',
            yKey: 'speedContribution',
            height: 300,
            formatYAxis: (value) => `${value}%`,
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data)) return [];

            const transformed = data.map((item: any) => ({
              name: item.facet || item.name || 'Unknown',
              speedContribution: item.speedContribution || item['latest.speedContribution'] || 0,
            }));

            return transformed;
          }}
        />
      </div>

      {/* Reindeer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reindeerStatus.map((reindeer) => (
          <ReindeerCard key={reindeer.name} reindeer={reindeer} />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400 text-center">
          ⭐ Lead positions provide navigation • 🔙 Rear positions provide stability
        </p>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(28, 231, 131, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(28, 231, 131, 0.8);
        }
      `}</style>
    </div>
  );
}
