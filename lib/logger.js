const {
  createLogger,
  format: { json, simple },
  transports: { Console }
} = require('winston')
const config = require('./config')

let logger

switch (config.get('NODE_ENV')) {
  case 'development':
    logger = createLogger({
      level: 'debug',
      format: json(),
      defaultMeta: { service: 'operator' },
      transports: [
        new Console({ format: simple() })
      ]
    })
    break
  case 'production':
    logger = createLogger({
      level: 'debug',
      format: json(),
      defaultMeta: { service: 'operator' },
      transports: [
        new Console({ format: json() })
      ]
    })
    break
  default:
    logger = createLogger({ transports: new Console({ silent: true }) })
    break
}

module.exports = logger
