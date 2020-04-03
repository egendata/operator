const { JWK } = require('@panva/jose')
const { sign } = require('./jwt')
const config = require('../config')

async function createConnectionEvent (serviceId, payload) {
  return sign({
    type: 'CONNECTION_EVENT',
    payload,
    iss: config.get('HOST'),
    aud: serviceId
  }, JWK.asKey(config.get('PRIVATE_JWK')), {
    kid: config.get('PUBLIC_JWK').kid
  })
}

const createLoginEvent = async (serviceId, payload) => {
  return sign({
    type: 'LOGIN_EVENT',
    aud: serviceId,
    iss: config.get('HOST'),
    payload
  }, JWK.asKey(config.get('PRIVATE_JWK')), {
    kid: config.get('PUBLIC_JWK').kid
  })
}

const createReadResponse = async ({ iss, sub, type }, paths) => {
  return sign({
    type,
    aud: iss,
    iss: config.get('HOST'),
    sub,
    paths
  }, JWK.asKey(config.get('PRIVATE_JWK')), {
    kid: config.get('PUBLIC_JWK').kid
  })
}

const createDataReadResponse = async ({ iss, sub }, paths) => {
  return createReadResponse({ iss, sub, type: 'DATA_READ_RESPONSE' }, paths)
}

const createRecipientsReadResponse = async ({ iss, sub }, paths) => {
  return createReadResponse({ iss, sub, type: 'RECIPIENTS_READ_RESPONSE' }, paths)
}

module.exports = {
  createConnectionEvent,
  createLoginEvent,
  createDataReadResponse,
  createRecipientsReadResponse
}
