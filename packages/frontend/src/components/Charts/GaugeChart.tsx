/**
 * GaugeChart Component
 *
 * A radial gauge chart for displaying percentage-based metrics (fuel, health, etc.).
 * Features color thresholds and animated transitions.
 */

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';

interface GaugeChartProps {
  value: number; // Current value
  max?: number; // Maximum value (default 100)
  size?: number; // Diameter of gauge
  label?: string; // Label to display in center
  unit?: string; // Unit of measurement (%, mph, etc.)
  showValue?: boolean; // Show numeric value in center
  animate?: boolean;
  colorThresholds?: { value: number; color: string }[]; // Color based on value ranges
}

const defaultColorThresholds = [
  { value: 70, color: '#00ac69' }, // Green for good
  { value: 40, color: '#ffd700' }, // Yellow/gold for warning
  { value: 0, color: '#ef5350' }, // Red for critical
];

export default function GaugeChart({
  value,
  max = 100,
  size = 200,
  label,
  unit = '%',
  showValue = true,
  animate = true,
  colorThresholds = defaultColorThresholds,
}: GaugeChartProps) {
  // Determine color based on value and thresholds
  const getColor = () => {
    // Sort thresholds by value descending
    const sorted = [...colorThresholds].sort((a, b) => b.value - a.value);

    for (const threshold of sorted) {
      if (value >= threshold.value) {
        return threshold.color;
      }
    }

    // Return last threshold color if value is below all thresholds
    return sorted[sorted.length - 1]?.color || '#ef5350';
  };

  const color = getColor();

  // Normalize value to percentage for display
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Data format for RadialBarChart
  const data = [
    {
      name: label || 'Value',
      value: percentage,
      fill: color,
    },
  ];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: '#1f2937' }}
            dataKey="value"
            cornerRadius={10}
            fill={color}
            isAnimationActive={animate}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <div className="text-center">
            <div
              className="font-bold"
              style={{
                fontSize: size / 5,
                color: color,
                lineHeight: 1,
              }}
            >
              {Math.round(value)}
              {unit && <span className="text-base ml-1">{unit}</span>}
            </div>
            {label && (
              <div
                className="text-gray-400 mt-1"
                style={{ fontSize: size / 15 }}
              >
                {label}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
