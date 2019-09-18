const accounts = require('./accounts')
const data = require('./data')
const services = require('./services')
const apm = require('./adapters/apm')

const handlers = {
  ACCOUNT_REGISTRATION: accounts.registerAccount,
  DATA_READ_REQUEST: data.read,
  DATA_WRITE: data.write,
  LOGIN_RESPONSE: services.loginResponse,
  CONNECTION_RESPONSE: services.connectionResponse,
  SERVICE_REGISTRATION: services.registerService
}

async function handle (req, res, next) {
  if (!handlers[req.payload.type]) {
    throw new Error('Unknown type')
  }
  apm.currentTransaction.name = `Msg: ${req.payload.type}`
  return handlers[req.payload.type](req, res, next)
}

module.exports = { handle }
