interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'green' | 'red' | 'gold' | 'newrelic' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'green',
  size = 'md',
  label,
  showPercentage = false,
  animated = false,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colorClasses = {
    green: 'bg-christmas-green',
    red: 'bg-christmas-red',
    gold: 'bg-christmas-gold',
    newrelic: 'bg-newrelic-green',
    blue: 'bg-blue-500',
  };

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className="space-y-1">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-gray-300">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-white">{percentage.toFixed(0)}%</span>
          )}
        </div>
      )}

      <div className={`w-full bg-gray-700/50 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shine effect */}
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
