/**
 * BillboardChart Component
 *
 * A large number display with optional trend indicator and sparkline.
 * Perfect for displaying key metrics like total deliveries, active elves, etc.
 */

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface BillboardChartProps {
  value: number | string;
  unit?: string;
  label?: string;
  trend?: {
    value: number; // Percentage change
    isPositive: boolean;
  };
  sparklineData?: Array<{ value: number }>; // Optional mini chart data
  sparklineColor?: string;
  formatValue?: (value: number | string) => string;
  color?: 'green' | 'red' | 'gold' | 'blue' | 'newrelic';
}

const colorClasses = {
  green: 'text-christmas-green',
  red: 'text-christmas-red',
  gold: 'text-christmas-gold',
  blue: 'text-blue-400',
  newrelic: 'text-newrelic-green',
};

const sparklineColors: Record<string, string> = {
  green: '#047857',
  red: '#ef5350',
  gold: '#ffd700',
  blue: '#64b5f6',
  newrelic: '#00ac69',
};

export default function BillboardChart({
  value,
  unit,
  label,
  trend,
  sparklineData,
  sparklineColor = 'newrelic',
  formatValue,
  color = 'newrelic',
}: BillboardChartProps) {
  // Default formatter
  const defaultFormat = (val: number | string) => {
    if (typeof val === 'number' && val != null && isFinite(val)) {
      // Format large numbers with commas and abbreviations
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
    if (val == null) {
      return '—';
    }
    return val.toString();
  };

  const formatter = formatValue || defaultFormat;
  const formattedValue = formatter(value);
  const textColor = colorClasses[color];
  const lineColor = sparklineColors[sparklineColor];

  return (
    <div className="flex flex-col h-full">
      {/* Main value display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {label && (
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            {label}
          </div>
        )}

        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-bold ${textColor}`}>
            {formattedValue}
          </span>
          {unit && (
            <span className="text-2xl text-gray-400 font-semibold">{unit}</span>
          )}
        </div>

        {/* Trend indicator */}
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <span
              className={`text-lg ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'}
            </span>
            <span className="text-sm text-gray-400">
              {Math.abs(trend.value).toFixed(1)}% {trend.isPositive ? 'increase' : 'decrease'}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="h-16 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
