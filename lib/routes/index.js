const { Router } = require('express')
const { middleware: { signed } } = require('@egendata/messaging')
const jwt = require('../services/jwt')
const config = require('../config')
const health = require('./health')
const messages = require('../messages')

const router = Router()

/* home page. */
router.get('/', (req, res, next) => {
  res.send({ name: 'Smooth Operator' })
})

/* health route */
router.use('/health', health)

/* communication */
router.use('/api', signed(jwt), async (req, res, next) => {
  try {
    await messages.handle(req, res, next)
  } catch (error) {
    next(error)
  }
})

router.get('/jwks/:kid?', (req, res, next) => {
  if (!req.params.kid) {
    res.send({ keys: [config.get('PUBLIC_KEY')] })
  } else {
    res.send(config.get('PUBLIC_KEY'))
  }
})

module.exports = router
