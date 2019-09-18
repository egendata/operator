if (process.env.APM_SERVER) {
  module.exports = require('elastic-apm-node').start({
    serviceName: process.env.APP_NAME || 'mydata-operator', // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    secretToken: process.env.APM_TOKEN || '', // Use if APM Server requires a token
    serverUrl: process.env.APM_SERVER, // Set APM Server URL
    captureBody: (process.env.NODE_ENV === 'production') // Don't save request body in production
      ? 'off'
      : 'errors'
  })
  console.log('APM instrumentation done')
} else {
  module.exports = {
    currentTransaction: {}
  }
  console.log('No APM instrumentation configured')
}
