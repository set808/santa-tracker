'use strict'

exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME || 'Santa-Incident-Service'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
    filepath: 'stdout'
  },
  allow_all_headers: true,
  distributed_tracing: {
    enabled: true
  },
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000
    },
    metrics: {
      enabled: true
    },
    local_decorating: {
      enabled: true
    }
  },
  custom_insights_events: {
    enabled: true,
    max_samples_stored: 10000
  }
}
