import { useState } from 'react';

interface TooltipProps {
  content: string;
  nrqlQuery?: string;
  docsLink?: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, nrqlQuery, docsLink, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>

      {isVisible && (
        <div className="absolute z-50 w-72 p-4 bg-gray-900 border border-newrelic-green rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2">
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-2">
            <div className="border-8 border-transparent border-t-gray-900"></div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <p className="text-sm text-white leading-relaxed">{content}</p>

            {nrqlQuery && (
              <div className="border-t border-gray-700 pt-3">
                <p className="text-xs font-semibold text-newrelic-green mb-2">
                  New Relic NRQL Query:
                </p>
                <code className="block text-xs bg-black/50 p-2 rounded font-mono text-green-300 overflow-x-auto">
                  {nrqlQuery}
                </code>
              </div>
            )}

            {docsLink && (
              <a
                href={docsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-newrelic-green hover:text-newrelic-teal transition-colors"
              >
                Learn more in New Relic Docs
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
