import IncidentCard from './IncidentCard';
import Tooltip from '../UI/Tooltip';
import { useNewRelicQuery } from '../../hooks/useNewRelicQuery';
import { incidentsActiveQuery } from '../../queries/nrql-queries';
import type { Incident } from 'shared-types';

export default function IncidentPanel() {
  const { data: incidentData } = useNewRelicQuery<any>(incidentsActiveQuery);

  // Transform query results to Incident array
  const activeIncidents: Incident[] = incidentData && Array.isArray(incidentData)
    ? incidentData.map((item: any) => ({
        id: item.id || item.incidentId || Math.random().toString(),
        type: item.type || 'technical-failure',
        severity: item.severity || 'medium',
        status: item.status || 'active',
        title: item.title || item.message || 'Unknown Incident',
        description: item.description || '',
        location: item.location || item.affectedSystem,
        timestamp: item.timestamp || new Date().toISOString(),
        resolutionTime: item.resolutionTime,
        impactedSystems: item.impactedSystems || [item.affectedSystem || 'Unknown'],
        realWorldAnalogy: item.realWorldAnalogy || '',
      }))
    : [];

  // Filter and sort incidents
  const activeOnly = activeIncidents.filter(
    (incident) => incident.status === 'active' || incident.status === 'investigating'
  );

  const sortedIncidents = [...activeIncidents].sort((a, b) => {
    // Sort by severity first
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const severityDiff =
      severityOrder[a.severity as keyof typeof severityOrder] -
      severityOrder[b.severity as keyof typeof severityOrder];

    if (severityDiff !== 0) return severityDiff;

    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Count by severity
  const severityCounts = activeOnly.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section className="rounded-lg border border-white/10 bg-slate-800/50 p-6 h-full flex flex-col">
      {/* Header with Tooltip */}
      <div className="mb-4">
        <Tooltip
          content="Real-time incident tracking and alerting powered by New Relic. Automatically detect, classify, and monitor incidents affecting Santa's operations. Each incident includes severity levels, impacted systems, and resolution status."
          nrqlQuery="SELECT count(*) FROM Incident WHERE status IN ('active', 'investigating') FACET severity SINCE 1 hour ago"
          docsLink="https://docs.newrelic.com/docs/alerts-applied-intelligence/"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 cursor-help">
              🚨 Incidents & Alerts
              <span className="text-sm text-gray-400">ℹ️</span>
            </h2>
            {activeOnly.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500 animate-pulse">
                  {activeOnly.length} Active
                </span>
              </div>
            )}
          </div>
        </Tooltip>
      </div>

      {/* Severity Summary */}
      {activeOnly.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/10">
          <h3 className="text-sm font-semibold text-gray-300 uppercase mb-3">
            Active Incidents by Severity
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">
                {severityCounts.critical || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Critical</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">
                {severityCounts.high || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">High</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-500">
                {severityCounts.medium || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Medium</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">
                {severityCounts.low || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Low</p>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      {sortedIncidents.length > 0 ? (
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {sortedIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex-1 flex flex-col justify-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-newrelic-green mb-2">
            All Systems Operational
          </h3>
          <p className="text-gray-400">
            No active incidents detected. Santa's operations are running smoothly!
          </p>
          <div className="mt-6 bg-newrelic-green/10 border border-newrelic-green/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-300">
              Continuous monitoring by New Relic ensures any issues are detected and reported
              immediately.
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      {sortedIncidents.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span>Critical - Immediate action required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span>High - Urgent attention needed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
              <span>Medium - Monitoring closely</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              <span>Low - Informational</span>
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
    </section>
  );
}
