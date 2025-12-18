import { useState } from 'react';
import MetricsDashboard from './components/Dashboard/MetricsDashboard';
import ReindeerPanel from './components/Reindeer/ReindeerPanel';
import WorkshopPanel from './components/Workshop/WorkshopPanel';
import DeliveryPanel from './components/Delivery/DeliveryPanel';
import IncidentPanel from './components/Incidents/IncidentPanel';
import SnowfallEffect from './components/UI/SnowfallEffect';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <SnowfallEffect />

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Santa Tracker</h1>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-newrelic-green hover:bg-newrelic-green/80 text-white rounded-lg transition-colors flex items-center gap-2"
            title="Refresh all data from New Relic"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Sleigh Metrics Section - Full Width */}
        <MetricsDashboard key={`metrics-${refreshKey}`} />

        {/* Reindeer Team Card - Full Width Row */}
        <ReindeerPanel key={`reindeer-${refreshKey}`} />

        {/* Main Dashboard Grid - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {/* Workshop Operations Card - Top left */}
          <WorkshopPanel key={`workshop-${refreshKey}`} />

          {/* Delivery Progress Card - Right side, spans 2 columns and 2 rows */}
          <div className="lg:col-span-2 lg:row-span-2">
            <DeliveryPanel key={`delivery-${refreshKey}`} />
          </div>

          {/* Incidents Card - Bottom left */}
          <IncidentPanel key={`incidents-${refreshKey}`} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-6 py-6 text-center text-sm text-gray-400">
          <p>Santa Tracker © 2025 | Powered by New Relic</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
