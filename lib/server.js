const config = require('./config')
require('./adapters/apm')

const { info, error } = require('./logger')

info(`NODE_ENV: ${config.get('NODE_ENV')}`)

const app = require('./app')

const http = require('http')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(config.get('PORT'))
app.set('port', port)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (err) {
  if (err.syscall !== 'listen') {
    throw err
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (err.code) {
    case 'EACCES':
      error(bind + ' requires elevated privileges')
      return process.exit(1)
    case 'EADDRINUSE':
      error(bind + ' is already in use')
      return process.exit(1)
    default:
      throw err
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  info('Listening on ' + bind)
}
