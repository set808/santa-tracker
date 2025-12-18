import { useState } from 'react';
import type { Incident } from 'shared-types';
import StatusBadge from '../UI/StatusBadge';

interface IncidentCardProps {
  incident: Incident;
}

export default function IncidentCard({ incident }: IncidentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIncidentIcon = (type: string) => {
    const icons: Record<string, string> = {
      'weather-delay': '🌨️',
      'reindeer-fatigue': '🦌',
      'chimney-obstruction': '🏠',
      'airspace-conflict': '✈️',
      'fuel-low': '⚡',
      'gift-mismatch': '🎁',
      'navigation-error': '🧭',
      'communication-loss': '📡',
    };
    return icons[type] || '⚠️';
  };

  const getTypeLabel = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Unknown';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleString();
  };

  return (
    <div
      className={`bg-white/5 backdrop-blur-sm border-2 rounded-xl p-4 transition-all duration-300 ${
        incident.severity === 'critical'
          ? 'border-red-500 bg-red-500/10'
          : incident.severity === 'high'
          ? 'border-orange-500 bg-orange-500/10'
          : incident.severity === 'medium'
          ? 'border-yellow-500 bg-yellow-500/10'
          : 'border-blue-500 bg-blue-500/10'
      } ${isExpanded ? 'ring-2 ring-white/20' : 'hover:bg-white/10'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-3xl">{getIncidentIcon(incident.type)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{incident.title}</h3>
            </div>
            <p className="text-sm text-gray-400">{getTypeLabel(incident.type)}</p>
          </div>
        </div>
        <StatusBadge
          status={incident.severity}
          type="severity"
          size="md"
          pulse={incident.severity === 'critical'}
        />
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 leading-relaxed">
        {incident.description}
      </p>

      {/* Location and Time */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
        {incident.location && (
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{incident.location}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span>🕐</span>
          <span>{formatTimestamp(incident.timestamp)}</span>
        </div>
        <StatusBadge status={incident.status} type="default" size="sm" />
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 mt-3 text-sm text-newrelic-green hover:text-newrelic-teal border-t border-white/10 transition-colors"
      >
        <span>{isExpanded ? 'Show Less' : 'Show More Details'}</span>
        <span className="transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/20 space-y-4 animate-in">
          {/* Real-World Analogy */}
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-newrelic-green uppercase mb-2 flex items-center gap-2">
              <span>💡</span> Real-World Analogy
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed">
              {incident.realWorldAnalogy}
            </p>
          </div>

          {/* Impacted Systems */}
          {incident.impactedSystems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase mb-2 flex items-center gap-2">
                <span>⚙️</span> Impacted Systems
              </h4>
              <div className="flex flex-wrap gap-2">
                {incident.impactedSystems.map((system, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded-full border border-white/20"
                  >
                    {system}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Time */}
          {incident.resolutionTime && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">✅</span>
                <div>
                  <p className="text-sm font-semibold text-green-400">
                    Resolved
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    {formatTimestamp(incident.resolutionTime)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* New Relic Integration Note */}
          <div className="bg-newrelic-green/10 border border-newrelic-green/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg">📊</span>
              <div className="flex-1">
                <p className="text-xs text-gray-300">
                  This incident is automatically detected and tracked using New Relic's alerting and
                  incident intelligence. View full details in your New Relic dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
