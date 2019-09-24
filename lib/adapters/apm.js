let apm

if (process.env.APM_SERVER) {
  apm = require('elastic-apm-node').start({
    serviceName: process.env.APP_NAME || 'egendata-operator', // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    secretToken: process.env.APM_TOKEN || '', // Use if APM Server requires a token
    serverUrl: process.env.APM_SERVER, // Set APM Server URL
    captureBody: (process.env.NODE_ENV === 'production') // Don't save request body in production
      ? 'off'
      : 'errors'
  })
  console.log('APM instrumentation done')
} else {
  console.log('No APM instrumentation configured')
}

function setTransactionName (name) {
  if (apm) {
    apm.currentTransaction.name = name
  }
}

function withSpan ({ name, type, options }, func) {
  if (!apm) {
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
