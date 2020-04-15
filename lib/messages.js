const accounts = require('./accounts')
const data = require('./data')
const services = require('./services')
const { setTransactionName } = require('./adapters/apm')

const handlers = {
  ACCOUNT_REGISTRATION: accounts.registerAccount,
  DATA_READ_REQUEST: data.read,
  DATA_WRITE: data.write,
  LOGIN_RESPONSE: services.loginResponse,
  CONNECTION_RESPONSE: services.connectionResponse,
  SERVICE_REGISTRATION: services.registerService,
  RECIPIENTS_READ_REQUEST: data.readRecipients,
  RECIPIENTS_WRITE: data.writeRecipients
}

async function handle (req, res, next) {
  if (!handlers[req.payload.type]) {
    throw new Error('Unknown type')
  }
  setTransactionName(req.payload.type)
  return handlers[req.payload.type](req, res, next)
}

module.exports = { handle }
