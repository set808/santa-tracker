/**
 * BarChart Component
 *
 * A reusable bar chart component for displaying categorical/faceted data from New Relic.
 * Supports both vertical and horizontal orientations with Christmas theme styling.
 */

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { RechartsTooltipProps } from '../../types/new-relic';

interface BarChartProps {
  data: Array<Record<string, number | string>>;
  xKey: string; // Key for x-axis (category)
  yKey: string | string[]; // Key(s) for y-axis (value)
  colors?: string | string[]; // Color(s) for bars
  height?: number;
  showGrid?: boolean;
  animate?: boolean;
  horizontal?: boolean; // If true, render horizontal bars
  formatXAxis?: (value: number | string) => string;
  formatYAxis?: (value: number | string) => string;
  formatTooltip?: (value: number | string) => string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  colorThresholds?: { value: number; color: string }[]; // Dynamic colors based on value
}

const defaultColors = ['#00ac69', '#ef5350', '#ffd700', '#64b5f6', '#9c27b0'];

export default function BarChart({
  data,
  xKey,
  yKey,
  colors,
  height = 300,
  showGrid = true,
  animate = true,
  horizontal = false,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  yAxisLabel,
  xAxisLabel,
  colorThresholds,
}: BarChartProps) {
  // Normalize yKey and colors to arrays
  const keys = Array.isArray(yKey) ? yKey : [yKey];
  const barColors = Array.isArray(colors)
    ? colors
    : colors
    ? [colors]
    : defaultColors.slice(0, keys.length);

  // Default formatters
  const defaultFormat = (value: number | string): string => {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value !== 'number' || !isFinite(value)) {
      return '';
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  };

  const xFormatter = formatXAxis || defaultFormat;
  const yFormatter = formatYAxis || defaultFormat;
  const tooltipFormatter = formatTooltip || defaultFormat;

  // Get color for a value based on thresholds
  const getColorForValue = (value: number, defaultColor: string) => {
    if (!colorThresholds) return defaultColor;

    // Sort thresholds by value descending
    const sorted = [...colorThresholds].sort((a, b) => b.value - a.value);

    for (const threshold of sorted) {
      if (value >= threshold.value) {
        return threshold.color;
      }
    }

    return defaultColor;
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: RechartsTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-gray-900/95 border border-newrelic-green/30 rounded-lg p-3 shadow-xl">
        <p className="text-sm text-gray-300 mb-2 font-semibold">{String(label)}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded"
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

  const ChartComponent = horizontal ? RechartsBarChart : RechartsBarChart;
  // In Recharts: layout='horizontal' = vertical bars, layout='vertical' = horizontal bars
  // So we invert: when user wants horizontal bars, use 'vertical' layout
  const layout = horizontal ? 'vertical' : 'horizontal';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ChartComponent
        data={data}
        layout={layout}
        margin={{ top: 5, right: 5, left: horizontal ? 60 : 0, bottom: 5 }}
      >
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            opacity={0.3}
            horizontal={!horizontal}
            vertical={horizontal}
          />
        )}

        {horizontal ? (
          <>
            <XAxis
              type="number"
              tickFormatter={yFormatter}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={yAxisLabel ? { value: yAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tickFormatter={xFormatter}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              width={50}
              label={xAxisLabel ? { value: xAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey={xKey}
              tickFormatter={xFormatter}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
            />
            <YAxis
              type="number"
              tickFormatter={yFormatter}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
          </>
        )}

        <Tooltip content={<CustomTooltip />} />

        {keys.length > 1 && (
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            iconType="square"
          />
        )}

        {keys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={barColors[index % barColors.length]}
            isAnimationActive={animate}
            name={key}
            radius={[4, 4, 0, 0]} // Rounded top corners
          >
            {colorThresholds && keys.length === 1 && data.map((entry, idx) => {
              const value = entry[key];
              const numericValue = typeof value === 'number' ? value : 0;
              return (
                <Cell
                  key={`cell-${idx}`}
                  fill={getColorForValue(numericValue, barColors[index])}
                />
              );
            })}
          </Bar>
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
