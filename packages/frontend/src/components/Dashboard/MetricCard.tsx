import type { ReactNode } from 'react';
import Tooltip from '../UI/Tooltip';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  tooltip?: string;
  nrqlQuery?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'green' | 'red' | 'gold' | 'blue' | 'newrelic';
  children?: ReactNode;
}

export default function MetricCard({
  title,
  value,
  unit,
  icon,
  tooltip,
  nrqlQuery,
  trend,
  color = 'newrelic',
  children,
}: MetricCardProps) {
  const colorClasses = {
    green: 'from-christmas-green/20 to-christmas-green/5 border-christmas-green',
    red: 'from-christmas-red/20 to-christmas-red/5 border-christmas-red',
    gold: 'from-christmas-gold/20 to-christmas-gold/5 border-christmas-gold',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500',
    newrelic: 'from-newrelic-green/20 to-newrelic-green/5 border-newrelic-green',
  };

  const textColorClasses = {
    green: 'text-christmas-green',
    red: 'text-christmas-red',
    gold: 'text-christmas-gold',
    blue: 'text-blue-400',
    newrelic: 'text-newrelic-green',
  };

  const content = (
    <div
      className={`relative bg-gradient-to-br ${colorClasses[color]} border-2 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 group overflow-hidden`}
    >
      {/* Animated glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

      {/* Value indicator bar */}
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-30"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex items-center gap-2">
          <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
            {title}
          </h3>
        </div>
        {tooltip && (
          <span className="text-xs text-gray-500 cursor-help">ℹ️</span>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`text-4xl font-bold ${textColorClasses[color]}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xl font-semibold text-gray-400">{unit}</span>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span className={trend.isPositive ? 'text-green-400' : 'text-red-400'}>
            {trend.isPositive ? '↑' : '↓'}
          </span>
          <span className="text-gray-400">
            {Math.abs(trend.value).toFixed(1)}% from last hour
          </span>
        </div>
      )}

      {/* Additional content */}
      {children && <div className="mt-3 pt-3 border-t border-white/10">{children}</div>}

      {/* New Relic indicator */}
      {nrqlQuery && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1 text-xs text-newrelic-green">
            <span>📊</span>
            <span>Monitored by New Relic</span>
          </div>
        </div>
      )}
    </div>
  );

  if (tooltip || nrqlQuery) {
    return (
      <Tooltip
        content={tooltip || 'Real-time metric from Santa\'s operations'}
        nrqlQuery={nrqlQuery}
        docsLink={nrqlQuery ? 'https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/' : undefined}
      >
        {content}
      </Tooltip>
    );
  }

  return content;
}
