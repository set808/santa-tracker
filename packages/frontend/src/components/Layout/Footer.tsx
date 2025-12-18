export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-christmas-darkGreen border-t-4 border-christmas-gold mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-christmas-gold font-christmas text-xl mb-3">
              About Santa Tracker
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Real-time monitoring of Santa's Christmas Eve operations powered by New Relic's
              observability platform. Track sleigh metrics, reindeer health, workshop operations,
              and delivery progress with enterprise-grade monitoring.
            </p>
          </div>

          {/* New Relic Resources */}
          <div>
            <h3 className="text-christmas-gold font-christmas text-xl mb-3">
              New Relic Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.newrelic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-newrelic-green hover:text-newrelic-teal transition-colors flex items-center gap-2"
                >
                  <span>📚</span> Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/get-started/introduction-nrql-new-relics-query-language/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-newrelic-green hover:text-newrelic-teal transition-colors flex items-center gap-2"
                >
                  <span>🔍</span> NRQL Query Language
                </a>
              </li>
              <li>
                <a
                  href="https://docs.newrelic.com/docs/apm/apm-ui-pages/monitoring/apm-summary-page-view-transaction-apdex-usage-data/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-newrelic-green hover:text-newrelic-teal transition-colors flex items-center gap-2"
                >
                  <span>📊</span> APM & Services
                </a>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="text-christmas-gold font-christmas text-xl mb-3">
              Technologies
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-newrelic-green">•</span> React & TypeScript
              </li>
              <li className="flex items-center gap-2">
                <span className="text-newrelic-green">•</span> New Relic APM
              </li>
              <li className="flex items-center gap-2">
                <span className="text-newrelic-green">•</span> Google Maps API
              </li>
              <li className="flex items-center gap-2">
                <span className="text-newrelic-green">•</span> Tailwind CSS
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-christmas-gold/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Santa Tracker. Built with New Relic Observability.
            </p>
            <div className="flex items-center gap-4 text-2xl">
              <span className="animate-twinkle">🎅</span>
              <span className="animate-twinkle animation-delay-200">🎄</span>
              <span className="animate-twinkle animation-delay-400">🎁</span>
              <span className="animate-twinkle animation-delay-600">⭐</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
