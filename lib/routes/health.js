const { Router } = require('express')

const postgres = require('../adapters/postgres')

const router = Router()

router.get('/', async (req, res, next) => {
  let statusCode = 200
  const status = {
    postgres: '?'
  }

  try {
    await postgres.query('SELECT NOW()')
    status.postgres = 'OK'
  } catch (error) {
    statusCode = 503
    status.postgres = '!OK'
  }

  res.status(statusCode).send(status)
})

module.exports = router
