import LoadingSpinner from '../UI/LoadingSpinner';
import ProgressBar from '../UI/ProgressBar';
import Tooltip from '../UI/Tooltip';
import { ChartCard } from '../Charts';
import { deliveryRateQuery, deliveryRegionalQuery, deliveryCurrentMetricsQuery } from '../../queries/nrql-queries';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';
import type { DeliveryMetrics } from 'shared-types';

export default function DeliveryPanel() {
  const { data: deliveryData, loading, error } = useNewRelicQuery<any>(deliveryCurrentMetricsQuery);

  const deliveryMetrics: DeliveryMetrics | null = deliveryData && deliveryData.length > 0
    ? {
        totalGiftsDelivered: deliveryData[0].totalGiftsDelivered || 0,
        totalGiftsRemaining: deliveryData[0].totalGiftsRemaining || 0,
        currentRegion: deliveryData[0].currentRegion || 'Unknown',
        deliveryRate: 0,
        countriesVisited: 0,
        totalCountries: 0,
        regionalBreakdown: [],
      }
    : null;

  if (loading || !deliveryMetrics) {
    return (
      <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          🎁 Delivery Progress
        </h2>
        <LoadingSpinner />
        <p className="text-center text-gray-300 mt-4 text-sm">
          {error ? `Error loading data: ${error.message}` : 'Loading delivery metrics...'}
        </p>
      </div>
    );
  }

  const totalGifts = (deliveryMetrics.totalGiftsDelivered ?? 0) + (deliveryMetrics.totalGiftsRemaining ?? 0);
  const overallProgress = totalGifts > 0 ? Math.round(((deliveryMetrics.totalGiftsDelivered ?? 0) / totalGifts) * 100) : 0;

  return (
    <div className="rounded-lg border border-white/10 bg-slate-800/50 p-6">
      {/* Header with Tooltip */}
      <div className="mb-4">
        <Tooltip
          content="Track Santa's delivery progress in real-time. Monitor gifts delivered per region, delivery rate, and overall completion percentage across all countries."
          nrqlQuery="SELECT count(*) as 'Total Delivered', rate(count(*), 1 second) as 'Delivery Rate' FROM DeliveryEvents WHERE status = 'delivered' SINCE 1 hour ago"
          docsLink="https://docs.newrelic.com/docs/apm/"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 cursor-help">
            🎁 Delivery Progress
            <span className="text-sm text-gray-400">ℹ️</span>
          </h2>
        </Tooltip>
      </div>

      {/* Overall Progress */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">
          Global Progress
        </h3>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Total Gifts Delivered</span>
            <span className="text-xl font-bold text-newrelic-green">
              {(deliveryMetrics.totalGiftsDelivered ?? 0).toLocaleString()}
            </span>
          </div>
          <ProgressBar
            value={overallProgress}
            color="green"
            size="lg"
            showPercentage
            animated={overallProgress < 100}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="text-lg font-bold text-gray-300">
              {(deliveryMetrics.totalGiftsRemaining ?? 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Delivery Rate</p>
            <p className="text-lg font-bold text-newrelic-green">
              {(deliveryMetrics.deliveryRate ?? 0).toFixed(1)}/sec
            </p>
          </div>
        </div>
      </div>

      {/* Countries Progress */}
      <div className="bg-white/5 rounded-lg p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-300 uppercase flex items-center gap-2">
            <span>🌍</span> Countries Visited
          </h3>
          <span className="text-lg font-bold text-white">
            {deliveryMetrics.countriesVisited ?? 0} / {deliveryMetrics.totalCountries ?? 0}
          </span>
        </div>
        <ProgressBar
          value={deliveryMetrics.countriesVisited ?? 0}
          max={deliveryMetrics.totalCountries ?? 0}
          color="blue"
          size="md"
          showPercentage
        />
      </div>

      {/* Current Region */}
      <div className="bg-gradient-to-br from-christmas-gold/20 to-christmas-gold/5 border-2 border-christmas-gold rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📍</span>
          <div>
            <p className="text-xs text-gray-400 uppercase">Current Region</p>
            <p className="text-xl font-bold text-christmas-gold">
              {deliveryMetrics.currentRegion ?? 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Delivery Rate Over Time */}
        <ChartCard
          title="Delivery Rate"
          icon="📈"
          queryConfig={deliveryRateQuery}
          chartType="line"
          color="green"
          tooltip="Gift delivery rate per minute over time"
          chartProps={{
            dataKeys: 'rate',
            height: 250,
            formatYAxis: (value) => value != null && isFinite(value) ? `${value.toFixed(1)}/min` : '',
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data)) return [];
            return data.map((item: any) => ({
              timestamp: item.beginTimeSeconds * 1000 || item.timestamp,
              rate: item['rate'] || item.rate || 0,
            }));
          }}
        />

        {/* Regional Deliveries Bar Chart */}
        <ChartCard
          title="Deliveries by Region"
          icon="🗺️"
          queryConfig={deliveryRegionalQuery}
          chartType="bar"
          color="gold"
          tooltip="Total deliveries per region in the last hour"
          chartProps={{
            xKey: 'region',
            yKey: 'deliveries',
            height: 250,
            formatYAxis: (value) => value != null && typeof value === 'number' && isFinite(value) ? value.toLocaleString() : '',
          }}
          transformData={(data) => {
            if (!data || !Array.isArray(data)) return [];
            return data.map((item: any) => ({
              region: item.facet || item.currentRegion || item.region || 'Unknown',
              deliveries: item['count'] || item.deliveries || 0,
            }));
          }}
        />
      </div>

      {/* Regional Breakdown */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3 flex items-center gap-2">
          <span>🗺️</span> Regional Breakdown
        </h3>
        <div className="space-y-3 pr-2">
          {(deliveryMetrics.regionalBreakdown ?? []).map((region) => (
            <div key={region.region} className="bg-white/5 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {region.region}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {region.countries.length} countries
                  </p>
                </div>
                <span className="text-sm font-bold text-newrelic-green">
                  {region.percentComplete.toFixed(1)}%
                </span>
              </div>

              <ProgressBar
                value={region.percentComplete}
                color="newrelic"
                size="sm"
              />

              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-gray-400">Delivered: </span>
                  <span className="text-white font-semibold">
                    {(region.giftsDelivered ?? 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Avg Time: </span>
                  <span className="text-white font-semibold">
                    {region.averageDeliveryTime.toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Message */}
      {overallProgress === 100 && (
        <div className="mt-4 bg-green-500/20 border border-green-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎉</span>
            <div>
              <p className="font-christmas text-lg text-green-400">
                Mission Complete!
              </p>
              <p className="text-sm text-gray-300 mt-1">
                All gifts have been successfully delivered. Merry Christmas!
              </p>
            </div>
          </div>
        </div>
      )}

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
