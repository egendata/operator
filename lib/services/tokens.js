const { JWK } = require('@panva/jose')
const { sign } = require('./jwt')
const config = require('../config')

async function createConnectionEvent (serviceId, payload) {
  return sign({
    type: 'CONNECTION_EVENT',
    payload,
    iss: config.get('HOST'),
    aud: serviceId
  }, JWK.asKey(config.get('PRIVATE_KEY')), {
    kid: config.get('PUBLIC_KEY').kid
  })
}

const createLoginEvent = async (serviceId, payload) => {
  return sign({
    type: 'LOGIN_EVENT',
    aud: serviceId,
    iss: config.get('HOST'),
    payload
  }, JWK.asKey(config.get('PRIVATE_KEY')), {
    kid: config.get('PUBLIC_KEY').kid
  })
}

const createDataReadResponse = async ({ iss, sub }, paths) => {
  return sign({
    type: 'DATA_READ_RESPONSE',
    aud: iss,
    iss: config.get('HOST'),
    sub,
    paths
  }, JWK.asKey(config.get('PRIVATE_KEY')), {
    kid: config.get('PUBLIC_KEY').kid
  })
}

module.exports = {
  createConnectionEvent,
  createLoginEvent,
  createDataReadResponse
}
