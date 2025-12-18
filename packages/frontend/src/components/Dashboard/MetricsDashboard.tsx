import LoadingSpinner from '../UI/LoadingSpinner';
import StatusBadge from '../UI/StatusBadge';
import { ChartCard } from '../Charts';
import {
  sleighSpeedQuery,
  sleighAltitudeQuery,
  sleighFuelQuery,
  sleighIntegrityQuery,
  sleighMetricsQuery,
} from '../../queries/nrql-queries';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';

interface SleighMetricsData {
  heading: number;
  structuralIntegrity: number;
  navigationStatus: string;
  magicFuelLevel: number;
}

export default function MetricsDashboard() {
  const { data: metricsData, loading, error } = useNewRelicQuery<SleighMetricsData[]>(sleighMetricsQuery);

  const sleighMetrics = metricsData && metricsData.length > 0 ? metricsData[0] : null;

  if (loading || !sleighMetrics) {
    return (
      <section className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Real-Time Sleigh Metrics
        </h2>
        <LoadingSpinner />
        <p className="text-center text-gray-300 mt-4">
          {error ? `Error loading data: ${error.message}` : 'Loading sleigh telemetry data...'}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            🚀 Real-Time Sleigh Metrics
          </h2>
          <p className="text-xs text-gray-400 mt-1">Live telemetry from Santa's sleigh</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={sleighMetrics.navigationStatus}
            type="health"
            size="md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Speed - Line Chart */}
        <ChartCard
          title="Speed Trend"
          icon="🚀"
          queryConfig={sleighSpeedQuery}
          chartType="line"
          color="newrelic"
          tooltip="Santa's sleigh speed over time measured in Mach (times the speed of sound)"
          chartProps={{
            dataKeys: 'average',
            height: 250,
            formatYAxis: (value) => value != null && isFinite(value) ? `${value.toFixed(1)} Mach` : '',
          }}
          transformData={(data) => {
            // Transform NerdGraph results to chart format
            if (!data || !Array.isArray(data)) return [];
            return data.map((item: any) => ({
              timestamp: item.beginTimeSeconds * 1000 || item.timestamp,
              average: item['average.speed'] || item.average || item.speed || 0,
            }));
          }}
        />

        {/* Altitude - Line Chart */}
        <ChartCard
          title="Altitude Trend"
          icon="⛰️"
          queryConfig={sleighAltitudeQuery}
          chartType="line"
          color="blue"
          tooltip="Sleigh altitude over time above sea level"
          chartProps={{
            dataKeys: 'average',
            height: 250,
            formatYAxis: (value) => value != null && isFinite(value) ? `${value.toLocaleString()} ft` : '',
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data)) return [];
            return data.map((item: any) => ({
              timestamp: item.beginTimeSeconds * 1000 || item.timestamp,
              average: item['average.altitude'] || item.average || item.altitude || 0,
            }));
          }}
        />

        {/* Magic Fuel Level - Gauge */}
        <ChartCard
          title="Magic Fuel Level"
          icon="⚡"
          queryConfig={sleighFuelQuery}
          chartType="gauge"
          color={sleighMetrics?.magicFuelLevel && sleighMetrics.magicFuelLevel > 50 ? 'green' : 'gold'}
          tooltip="Current magic fuel level - the sleigh runs on Christmas spirit, cookies, and carrots"
          chartProps={{
            dataKeys: 'fuel',
            height: 200,
            unit: '%',
            label: 'Fuel',
            max: 100,
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data) || data.length === 0) return 75; // Default value
            const latest = data[0];
            return latest['latest.magicFuelLevel'] || latest.fuel || latest.magicFuelLevel || 75;
          }}
        />

        {/* Structural Integrity - Gauge */}
        <ChartCard
          title="Structural Integrity"
          icon="🛡️"
          queryConfig={sleighIntegrityQuery}
          chartType="gauge"
          color="green"
          tooltip="Sleigh structural integrity percentage"
          chartProps={{
            dataKeys: 'integrity',
            height: 200,
            unit: '%',
            label: 'Integrity',
            max: 100,
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data) || data.length === 0) return 95; // Default value
            const latest = data[0];
            return latest['latest.structuralIntegrity'] || latest.integrity || latest.structuralIntegrity || 95;
          }}
        />
      </div>

      {/* Divider */}
      <div className="my-6 border-t-2 border-gradient-to-r from-transparent via-christmas-gold/30 to-transparent"></div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Heading */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border-2 border-white/10 hover:border-newrelic-green/50 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Heading</p>
              <p className="text-2xl font-bold text-white mt-1">
                {sleighMetrics.heading}°
              </p>
            </div>
            <span className="text-3xl">🧭</span>
          </div>
        </div>

        {/* Structural Integrity */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border-2 border-white/10 hover:border-newrelic-green/50 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Structural Integrity</p>
              <p className="text-2xl font-bold text-white mt-1">
                {sleighMetrics.structuralIntegrity?.toFixed(1) ?? '0.0'}%
              </p>
            </div>
            <span className="text-3xl">🛡️</span>
          </div>
        </div>

        {/* Navigation Status */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl p-5 border-2 border-white/10 hover:border-newrelic-green/50 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase">Navigation</p>
              <div className="mt-2">
                <StatusBadge
                  status={sleighMetrics.navigationStatus}
                  type="health"
                  size="md"
                />
              </div>
            </div>
            <span className="text-3xl">🗺️</span>
          </div>
        </div>
      </div>
    </section>
  );
}
