/**
 * TimeSeriesChart Component
 *
 * A reusable line chart component for displaying time-series data from New Relic.
 * Styled with Christmas theme colors and supports multiple data series.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import type { RechartsTooltipProps } from '../../types/new-relic';

interface TimeSeriesChartProps {
  data: Array<Record<string, number | string>>;
  dataKeys: string | string[]; // Single key or array for multiple lines
  colors?: string | string[]; // Corresponding colors for each line
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
  xAxisKey?: string; // Key for x-axis, default is 'timestamp'
  formatXAxis?: (value: number | string) => string;
  formatYAxis?: (value: number | string) => string;
  formatTooltip?: (value: number | string) => string;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

const defaultColors = ['#00ac69', '#ef5350', '#ffd700', '#64b5f6', '#9c27b0'];

export default function TimeSeriesChart({
  data,
  dataKeys,
  colors,
  height = 300,
  showGrid = true,
  animate = true,
  xAxisKey = 'timestamp',
  formatXAxis,
  formatYAxis,
  formatTooltip,
  yAxisLabel,
  xAxisLabel,
}: TimeSeriesChartProps) {
  // Normalize dataKeys and colors to arrays
  const keys = Array.isArray(dataKeys) ? dataKeys : [dataKeys];
  const lineColors = Array.isArray(colors)
    ? colors
    : colors
    ? [colors]
    : defaultColors.slice(0, keys.length);

  // Default formatters
  const defaultFormatXAxis = (value: number | string): string => {
    if (typeof value === 'number' && value > 1000000000) {
      return format(new Date(value), 'HH:mm:ss');
    }
    return String(value);
  };

  const defaultFormatYAxis = (value: number | string): string => {
    if (value == null || typeof value !== 'number' || !isFinite(value)) {
      return '';
    }
    return value.toLocaleString();
  };

  const defaultFormatTooltip = (value: number | string): string => {
    if (value == null || typeof value !== 'number' || !isFinite(value)) {
      return '—';
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const xFormatter = formatXAxis || defaultFormatXAxis;
  const yFormatter = formatYAxis || defaultFormatYAxis;
  const tooltipFormatter = formatTooltip || defaultFormatTooltip;

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const formattedLabel =
      typeof label === 'number' && label > 1000000000
        ? format(new Date(label), 'MMM d, HH:mm:ss')
        : String(label);

    return (
      <div className="bg-gray-900/95 border border-newrelic-green/30 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-2">{formattedLabel}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-semibold">
              {tooltipFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-gray-500 text-sm"
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
        )}
        <XAxis
          dataKey={xAxisKey}
          tickFormatter={xFormatter}
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
        />
        <YAxis
          tickFormatter={yFormatter}
          stroke="#9ca3af"
          style={{ fontSize: '12px' }}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '12px' }}
          iconType="line"
        />
        {keys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={lineColors[index % lineColors.length]}
            strokeWidth={2}
            dot={data.length < 20} // Only show dots if we have few data points
            activeDot={{ r: 6 }}
            isAnimationActive={animate}
            name={key}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
