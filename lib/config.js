require('dotenv').config()
const { JWK } = require('@panva/jose')

const config = require('nconf')
  .use('memory')
  .env(['PORT', 'HOST', 'PRIVATE_KEY', 'PGHOST', 'PGUSER', 'PGPORT', 'PGPASSWORD', 'PGDATABASE', 'NODE_ENV', 'APP_NAME', 'APM_SERVER', 'APM_TOKEN'])

if (process.env.NODE_ENV === 'production') {
  config.required(['PORT', 'HOST', 'PRIVATE_KEY'])
}

const operatorIP = require('ip').address()
const DEFAULT_OPERATOR_PORT = 3000
const DEFAULT_HOST = `http://${operatorIP}:${config.get('PORT') || DEFAULT_OPERATOR_PORT}`

config.defaults({
  PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQDgR0M9RBFT26AseaNYy9g5YX+YQhbskFTAp0aCO6h/8xPAOzkd\n7sO+Lqrx4Ljs8iuUTv7JUbx8+ml+7IMKYjpFx4eFQ1kcEW9IL5xSKKcHt2O359cy\n5KbBExqj4Fr2JkmCE+XcMJa5GGOnpNKB92pmJtfOkjVBVQ280n/j8suyCwIDAQAB\nAoGBAMwGqBl86ZJy0nSDN2EZF5ujoXJ+dOJBrogP5CmnYfL7y3Ttq1kakwFY7PPb\nLf+HkrN5ZXj5HVJIb14ihFcW4tBR2EtABhuv2J6ZNx0KnDxUj+mJlb7GNgr5eayI\nUibIu8/eQh2+CGMilI/KR8zlRiHpD8BgttfBaRktGIrzklQJAkEA9C8JgnAGUbPp\n3rc3dEZR6pEcOGI5Fjo3uvhbOYO5oa4tJszNF1Fh1oUmn17J6yoMnh0qPG4snL2B\nOgSB8OCOnwJBAOshovf7obbVZFzQ7ikYImT/pqz7f7eV1+Uv1MRfGsXAc0EAXDrh\nAPiJ5icWkeRDCFxaTAy/8lrDGgDcL2CSoRUCQQCem4L4x91C6rMJaEbL7vU8gL8s\n3JgqGOykNLfElwxXubQ4VKUO9Vywo9JfiIlth+WkOlt53zJ5KRqsXcstdB8PAkAo\nw6IfYA6/Reuqc8Z2dWqxG+lnoAqaZ24Qm+RFTz+y/RR+NnPG+W9Tp4SxTiZo7n4q\nlLUOmNCJj72YXJQSKBmpAkAyDc4PrJ3nFt45BOEnRuXE60Lv3VzLPdWggOLcKTbW\nr6NAWQS0VNdXEmJVmdoKFhJAeUvLrXPtBGqPS7HO6A8A\n-----END RSA PRIVATE KEY-----\n',
  PORT: DEFAULT_OPERATOR_PORT,
  HOST: DEFAULT_HOST,
  PGHOST: operatorIP,
  PGUSER: 'postgresuser',
  PGPORT: '5432',
  PGPASSWORD: 'postgrespassword',
  PGDATABASE: 'egendata',
  NODE_ENV: 'development',
  APP_NAME: 'egendata-operator',
  APM_SERVER: `http://${operatorIP}:8200`,
  APM_TOKEN: 'abc'
})

const PRIVATE_JWK = getPrivateJWKFromPEM(config.get('HOST'), config.get('PRIVATE_KEY'))
config.set('PRIVATE_JWK', PRIVATE_JWK)
config.set('PUBLIC_JWK', getPublicJWKFromPrivateJWK(PRIVATE_JWK))

function exitWith (message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function getPrivateJWKFromPEM (host, rsaKey) {
  const rxPEM = /^-----BEGIN RSA PRIVATE KEY-----\n([a-zA-Z0-9+/=]*\n)*-----END RSA PRIVATE KEY-----\n?$/
  if (typeof rsaKey !== 'string' || !rxPEM.test(rsaKey)) {
    exitWith('Unknown key format for PRIVATE_KEY')
  }

  const keyConfig = {
    kid: `${host}/jwks/operator_key`,
    use: 'sig'
  }
  return JWK.asKey(rsaKey, keyConfig).toJWK(true)
}

function getPublicJWKFromPrivateJWK ({ e, kid, kty, n, use }) {
  return { e, kid, kty, n, use }
}

module.exports = config
