const { JWK } = require('@panva/jose')
const { query } = require('../lib/adapters/postgres')
const { registerAccount } = require('../lib/accounts')

jest.mock('../lib/adapters/postgres', () => ({ query: jest.fn() }))

describe('accounts', () => {
  describe('#registerAccount', () => {
    let header, payload, res
    beforeEach(async () => {
      res = {
        sendStatus: jest.fn()
      }

      const jwk = await JWK.generate('RSA', 1024, {
        kid: 'egendata://account/jwks/account_key',
        use: 'sig'
      }, true)
      header = {
        jwk
      }
      payload = {
        type: 'ACCOUNT_REGISTRATION',
        iss: `egendata://account/${jwk.thumbprint}`,
        pds: {
          provider: 'dropbox',
          access_token: 'foobar'
        }
      }
    })
    it('calls postgres with correct parameters', async () => {
      await registerAccount({ header, payload }, res)
      expect(query).toHaveBeenCalledWith(expect.any(String), [
        payload.iss, JSON.stringify(header.jwk), 'dropbox', Buffer.from('foobar')
      ])
    })

    it('responds with 201', async () => {
      await registerAccount({ header, payload }, res)
      expect(res.sendStatus).toHaveBeenCalledWith(201)
    })
  })
})
