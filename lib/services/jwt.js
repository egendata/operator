const { JWT, JWK } = require('@panva/jose')
const { token } = require('@egendata/messaging')
const config = require('../config')
const { withSpan } = require('../adapters/apm')
const { sign, verify } = token({
  sign: withSpan({ name: 'JWT: sign', type: 'crypto' }, (payload, key, header) => JWT.sign(payload, key, { header })),
  decode: (tok, opts) => {
    const { payload, header, signature } = JWT.decode(tok, opts)
    return { claimsSet: payload, header, signature }
  },
  verify: withSpan({ name: 'JWT: verify', type: 'crypto' }, (tok, jwk) => JWT.verify(tok, JWK.asKey(jwk)))
})

async function loginEventToken (audience, payload) {
  return sign({
    type: 'LOGIN_EVENT',
    payload
  }, JWK.asKey(config.get('PRIVATE_JWK')), {
    issuer: config.get('HOST'),
    audience
  })
}

module.exports = {
  sign,
  verify,
  loginEventToken
}
