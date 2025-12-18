/**
 * ChartCard Component
 *
 * A card component that integrates useNewRelicQuery hook with chart visualization.
 * Automatically fetches data from New Relic and renders the appropriate chart type.
 */

import type { ReactNode } from 'react';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';
import type { NRQLQueryConfig } from '../../types/new-relic';
import Tooltip from '../UI/Tooltip';
import LoadingSpinner from '../UI/LoadingSpinner';
import TimeSeriesChart from './TimeSeriesChart';
import BarChart from './BarChart';
import GaugeChart from './GaugeChart';
import BillboardChart from './BillboardChart';

interface ChartCardProps {
  title: string;
  icon: string;
  queryConfig: NRQLQueryConfig;
  chartType: 'line' | 'bar' | 'gauge' | 'billboard';
  color?: 'green' | 'red' | 'gold' | 'blue' | 'newrelic';
  tooltip?: string;
  // Chart-specific props
  chartProps?: {
    dataKeys?: string | string[];
    xKey?: string;
    yKey?: string | string[];
    height?: number;
    showGrid?: boolean;
    horizontal?: boolean;
    formatValue?: (value: any) => string;
    formatXAxis?: (value: any) => string;
    formatYAxis?: (value: any) => string;
    unit?: string;
    label?: string;
    max?: number;
  };
  // Optional custom renderer for complex cases
  renderChart?: (data: any) => ReactNode;
  // Data transformer - transform raw query results before passing to chart
  transformData?: (data: any) => any;
}

export default function ChartCard({
  title,
  icon,
  queryConfig,
  chartType,
  color = 'newrelic',
  tooltip,
  chartProps = {},
  renderChart,
  transformData,
}: ChartCardProps) {
  const colorClasses = {
    green: 'from-christmas-green/20 to-christmas-green/5 border-christmas-green',
    red: 'from-christmas-red/20 to-christmas-red/5 border-christmas-red',
    gold: 'from-christmas-gold/20 to-christmas-gold/5 border-christmas-gold',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500',
    newrelic: 'from-newrelic-green/20 to-newrelic-green/5 border-newrelic-green',
  };

  // Fetch data using the hook
  const { data, loading, error } = useNewRelicQuery(queryConfig, {
    enabled: true,
    refetchInterval: queryConfig.refreshInterval,
  });

  // Transform data if transformer provided
  const chartData = transformData && data ? transformData(data) : data;

  // Render the appropriate chart based on type
  const renderChartContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-400">
          <span className="text-4xl mb-2">⚠️</span>
          <p className="text-sm text-center px-4">{error.message}</p>
          <p className="text-xs text-gray-500 mt-2">Check console for details</p>
        </div>
      );
    }

    if (!chartData || (Array.isArray(chartData) && chartData.length === 0)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <span className="text-4xl mb-2">📭</span>
          <p className="text-sm">No data available</p>
        </div>
      );
    }

    // Use custom renderer if provided
    if (renderChart) {
      return renderChart(chartData);
    }

    // Render based on chart type
    switch (chartType) {
      case 'line':
        return (
          <TimeSeriesChart
            data={Array.isArray(chartData) ? chartData : [chartData]}
            dataKeys={chartProps.dataKeys || 'value'}
            height={chartProps.height || 250}
            showGrid={chartProps.showGrid !== false}
            formatXAxis={chartProps.formatXAxis}
            formatYAxis={chartProps.formatYAxis}
          />
        );

      case 'bar':
        return (
          <BarChart
            data={Array.isArray(chartData) ? chartData : [chartData]}
            xKey={chartProps.xKey || 'name'}
            yKey={chartProps.yKey || 'value'}
            height={chartProps.height || 250}
            showGrid={chartProps.showGrid !== false}
            horizontal={chartProps.horizontal}
            formatXAxis={chartProps.formatXAxis}
            formatYAxis={chartProps.formatYAxis}
          />
        );

      case 'gauge':
        // For gauge, expect a single value or extract from first item
        const gaugeValue = typeof chartData === 'number'
          ? chartData
          : Array.isArray(chartData) && chartData.length > 0
          ? chartData[0][chartProps.dataKeys as string || 'value']
          : 0;

        return (
          <div className="flex items-center justify-center py-4">
            <GaugeChart
              value={gaugeValue}
              max={chartProps.max || 100}
              label={chartProps.label}
              unit={chartProps.unit}
              size={chartProps.height || 200}
            />
          </div>
        );

      case 'billboard':
        // For billboard, expect a single value or extract from first item
        const billboardValue = typeof chartData === 'number'
          ? chartData
          : Array.isArray(chartData) && chartData.length > 0
          ? chartData[0][chartProps.dataKeys as string || 'value']
          : 0;

        return (
          <div className="py-4">
            <BillboardChart
              value={billboardValue}
              unit={chartProps.unit}
              label={chartProps.label}
              formatValue={chartProps.formatValue}
              color={color}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>Unsupported chart type: {chartType}</p>
          </div>
        );
    }
  };

  const cardContent = (
    <div
      className={`relative bg-gradient-to-br ${colorClasses[color]} border-2 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden`}
    >
      {/* Animated glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {(tooltip || queryConfig.query) && (
          <span className="text-xs text-gray-500 cursor-help">ℹ️</span>
        )}
      </div>

      {/* Chart Content */}
      <div className="relative">
        {renderChartContent()}
      </div>

      {/* New Relic indicator */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-newrelic-green">
            <span>📊</span>
            <span>Real-time from New Relic</span>
          </div>
          {!loading && !error && (
            <div className="text-xs text-gray-500">
              Refreshes every {(queryConfig.refreshInterval / 1000).toFixed(0)}s
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Wrap with tooltip if provided
  if (tooltip || queryConfig.query) {
    return (
      <Tooltip
        content={tooltip || queryConfig.description}
        nrqlQuery={queryConfig.query}
        docsLink="https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/"
      >
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
}
