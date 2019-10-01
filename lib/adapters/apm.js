const config = require('../config')
const { info } = require('../logger')
let apm

if (config.get('APM_SERVER')) {
  apm = require('elastic-apm-node').start({
    serviceName: config.get('APP_NAME'), // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    secretToken: config.get('APM_TOKEN'), // Use if APM Server requires a token
    serverUrl: config.get('APM_SERVER'), // Set APM Server URL
    captureBody: (config.get('NODE_ENV') === 'production') // Don't save request body in production
      ? 'off'
      : 'errors'
  })
  info('APM instrumentation done')
} else {
  info('No APM instrumentation configured')
}

function setTransactionName (name) {
  if (apm && apm.currentTransaction) {
    apm.currentTransaction.name = name
  }
}

function withSpan ({ name, type, options }, func) {
  if (!apm || !apm.currentTransaction) {
    return func
  }

  return async (...args) => {
    const span = apm.currentTransaction.startSpan(name, type, options)
    try {
      return await func(...args)
    } catch (error) {
      apm.captureError(error)
      throw error
    } finally {
      span.end()
    }
  }
}

module.exports = {
  setTransactionName,
  withSpan
}
