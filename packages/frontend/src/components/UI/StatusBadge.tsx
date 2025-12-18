import type { IncidentSeverity } from 'shared-types';

interface StatusBadgeProps {
  status: string | IncidentSeverity;
  type?: 'default' | 'severity' | 'health' | 'connection';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export default function StatusBadge({ status, type = 'default', size = 'md', pulse = false }: StatusBadgeProps) {
  const getColors = () => {
    if (type === 'severity') {
      switch (status) {
        case 'critical':
          return 'bg-red-600 text-white border-red-400';
        case 'high':
          return 'bg-orange-600 text-white border-orange-400';
        case 'medium':
          return 'bg-yellow-600 text-white border-yellow-400';
        case 'low':
          return 'bg-blue-600 text-white border-blue-400';
        default:
          return 'bg-gray-600 text-white border-gray-400';
      }
    }

    if (type === 'health') {
      switch (status) {
        case 'excellent':
        case 'healthy':
        case 'optimal':
          return 'bg-green-600 text-white border-green-400';
        case 'good':
          return 'bg-lime-600 text-white border-lime-400';
        case 'tired':
        case 'degraded':
          return 'bg-yellow-600 text-white border-yellow-400';
        case 'exhausted':
        case 'critical':
          return 'bg-red-600 text-white border-red-400';
        case 'resting':
          return 'bg-blue-600 text-white border-blue-400';
        default:
          return 'bg-gray-600 text-white border-gray-400';
      }
    }

    if (type === 'connection') {
      switch (status) {
        case 'connected':
        case 'online':
          return 'bg-newrelic-green text-gray-900 border-newrelic-teal';
        case 'connecting':
          return 'bg-yellow-500 text-gray-900 border-yellow-400';
        case 'disconnected':
        case 'offline':
          return 'bg-red-600 text-white border-red-400';
        default:
          return 'bg-gray-600 text-white border-gray-400';
      }
    }

    // Default type
    switch (status) {
      case 'active':
      case 'resolved':
        return 'bg-green-600 text-white border-green-400';
      case 'investigating':
      case 'pending':
        return 'bg-yellow-600 text-white border-yellow-400';
      case 'error':
        return 'bg-red-600 text-white border-red-400';
      default:
        return 'bg-gray-600 text-white border-gray-400';
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border-2 ${getColors()} ${
        sizeClasses[size]
      } ${pulse ? 'animate-pulse' : ''}`}
    >
      {/* Status dot */}
      <span className="w-2 h-2 rounded-full bg-current opacity-75"></span>
      <span className="capitalize">{status}</span>
    </span>
  );
}
