require('dotenv').config()
const { JWK } = require('@panva/jose')
const config = require('nconf')
  .use('memory')
  .argv()
  .env()
  .defaults({
    NODE_ENV: 'development',
    APP_NAME: 'egendata-operator'
  })

function exitWith (message) {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

function privateKey (host, rsaKey) {
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

function publicKey ({ e, kid, kty, n, use }) {
  return { e, kid, kty, n, use }
}

function checkMissingKeys (config, keys) {
  const missing = keys.filter(key => {
    return !config.get(key)
  })
  if (missing.length > 0) {
    exitWith(`Your config is missing the following keys: ${missing.join(', ')}`)
  }
}

let ip, PORT, HOST, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PRIVATE_KEY, PUBLIC_KEY

switch (config.get('NODE_ENV')) {
  case 'development':
    ip = require('ip').address()
    PORT = config.get('PORT') || '3000'
    HOST = `http://${ip}:${PORT}`
    PGHOST = config.get('PGHOST') || ip
    PGPORT = config.get('PGPORT') || '5432'
    PGUSER = config.get('PGUSER') || 'postgresuser'
    PGPASSWORD = config.get('PGPASSWORD') || 'postgrespassword'
    PGDATABASE = config.get('PGDATABASE') || 'mydata'
    PRIVATE_KEY = privateKey(HOST, config.get('PRIVATE_KEY') || '-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQDgR0M9RBFT26AseaNYy9g5YX+YQhbskFTAp0aCO6h/8xPAOzkd\n7sO+Lqrx4Ljs8iuUTv7JUbx8+ml+7IMKYjpFx4eFQ1kcEW9IL5xSKKcHt2O359cy\n5KbBExqj4Fr2JkmCE+XcMJa5GGOnpNKB92pmJtfOkjVBVQ280n/j8suyCwIDAQAB\nAoGBAMwGqBl86ZJy0nSDN2EZF5ujoXJ+dOJBrogP5CmnYfL7y3Ttq1kakwFY7PPb\nLf+HkrN5ZXj5HVJIb14ihFcW4tBR2EtABhuv2J6ZNx0KnDxUj+mJlb7GNgr5eayI\nUibIu8/eQh2+CGMilI/KR8zlRiHpD8BgttfBaRktGIrzklQJAkEA9C8JgnAGUbPp\n3rc3dEZR6pEcOGI5Fjo3uvhbOYO5oa4tJszNF1Fh1oUmn17J6yoMnh0qPG4snL2B\nOgSB8OCOnwJBAOshovf7obbVZFzQ7ikYImT/pqz7f7eV1+Uv1MRfGsXAc0EAXDrh\nAPiJ5icWkeRDCFxaTAy/8lrDGgDcL2CSoRUCQQCem4L4x91C6rMJaEbL7vU8gL8s\n3JgqGOykNLfElwxXubQ4VKUO9Vywo9JfiIlth+WkOlt53zJ5KRqsXcstdB8PAkAo\nw6IfYA6/Reuqc8Z2dWqxG+lnoAqaZ24Qm+RFTz+y/RR+NnPG+W9Tp4SxTiZo7n4q\nlLUOmNCJj72YXJQSKBmpAkAyDc4PrJ3nFt45BOEnRuXE60Lv3VzLPdWggOLcKTbW\nr6NAWQS0VNdXEmJVmdoKFhJAeUvLrXPtBGqPS7HO6A8A\n-----END RSA PRIVATE KEY-----\n')
    PUBLIC_KEY = publicKey(PRIVATE_KEY)

    module.exports = config.defaults({
      PORT,
      HOST,
      PGHOST,
      PGPORT,
      PGUSER,
      PGPASSWORD,
      PGDATABASE,
      PRIVATE_KEY,
      PUBLIC_KEY,
      APM_SERVER: `http://${ip}:8200`,
      APM_TOKEN: 'abc'
    })
    break
  case 'test':
    PORT = '3000'
    HOST = `http://localhost:${PORT}`
    PGHOST = 'localhost'
    PGPORT = '5432'
    PGUSER = 'postgresuser'
    PGPASSWORD = 'postgrespassword'
    PGDATABASE = 'mydata'
    PRIVATE_KEY = privateKey(HOST, '-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQDgR0M9RBFT26AseaNYy9g5YX+YQhbskFTAp0aCO6h/8xPAOzkd\n7sO+Lqrx4Ljs8iuUTv7JUbx8+ml+7IMKYjpFx4eFQ1kcEW9IL5xSKKcHt2O359cy\n5KbBExqj4Fr2JkmCE+XcMJa5GGOnpNKB92pmJtfOkjVBVQ280n/j8suyCwIDAQAB\nAoGBAMwGqBl86ZJy0nSDN2EZF5ujoXJ+dOJBrogP5CmnYfL7y3Ttq1kakwFY7PPb\nLf+HkrN5ZXj5HVJIb14ihFcW4tBR2EtABhuv2J6ZNx0KnDxUj+mJlb7GNgr5eayI\nUibIu8/eQh2+CGMilI/KR8zlRiHpD8BgttfBaRktGIrzklQJAkEA9C8JgnAGUbPp\n3rc3dEZR6pEcOGI5Fjo3uvhbOYO5oa4tJszNF1Fh1oUmn17J6yoMnh0qPG4snL2B\nOgSB8OCOnwJBAOshovf7obbVZFzQ7ikYImT/pqz7f7eV1+Uv1MRfGsXAc0EAXDrh\nAPiJ5icWkeRDCFxaTAy/8lrDGgDcL2CSoRUCQQCem4L4x91C6rMJaEbL7vU8gL8s\n3JgqGOykNLfElwxXubQ4VKUO9Vywo9JfiIlth+WkOlt53zJ5KRqsXcstdB8PAkAo\nw6IfYA6/Reuqc8Z2dWqxG+lnoAqaZ24Qm+RFTz+y/RR+NnPG+W9Tp4SxTiZo7n4q\nlLUOmNCJj72YXJQSKBmpAkAyDc4PrJ3nFt45BOEnRuXE60Lv3VzLPdWggOLcKTbW\nr6NAWQS0VNdXEmJVmdoKFhJAeUvLrXPtBGqPS7HO6A8A\n-----END RSA PRIVATE KEY-----\n')
    PUBLIC_KEY = publicKey(PRIVATE_KEY)

    module.exports = config.defaults({
      PORT,
      HOST,
      PGHOST,
      PGPORT,
      PGUSER,
      PGPASSWORD,
      PGDATABASE,
      PRIVATE_KEY,
      PUBLIC_KEY,
      APM_SERVER: '',
      APM_TOKEN: ''
    })
    break
  default:
    checkMissingKeys(config, ['PORT', 'HOST', 'DATABASE_URL', 'PRIVATE_KEY'])

    config.set('PRIVATE_KEY', privateKey(config.get('HOST'), config.get('PRIVATE_KEY')))
    config.set('PUBLIC_KEY', publicKey(config.get('PRIVATE_KEY')))

    module.exports = config
    break
}
