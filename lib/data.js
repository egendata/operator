const { camelCase } = require('changecase-objects')
const { getWritePermissionPdsData, readPermission } = require('./sqlStatements')
const { multiple } = require('./adapters/postgres')
const { get } = require('./adapters/pds')
const {
  createDataReadResponse,
  createRecipientsReadResponse
} = require('./services/tokens')

async function getData (payload) {
  const connectionId = payload.sub
  const statements = payload.paths.map(({ domain, area }) =>
    readPermission({
      connectionId,
      domain,
      area,
      serviceId: payload.iss
    })
  )
  const result = await multiple(statements)
  const reads = []
  for (const { rows } of result) {
    for (const row of rows) {
      const { pdsProvider, pdsCredentials, domain, area } = camelCase(row)
      const { readFile } = get({ pdsProvider, pdsCredentials })

      const path = `/data/${encodeURIComponent(
        connectionId
      )}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
      reads.push(
        readFile(path, 'utf8')
          .then(data => ({
            domain,
            area,
            data: data && JSON.parse(data)
          }))
          .catch(err => {
            if (err.code === 'ENOENT') {
              return { domain, area }
            } else {
              return {
                domain,
                area,
                error: {
                  message: err.message,
                  status: err.status,
                  code: err.code
                }
              }
            }
          })
      )
    }
  }
  return Promise.all(reads)
}

async function read ({ payload }, res, next) {
  const paths = await getData(payload)
  const token = await createDataReadResponse(payload, paths)
  res
    .status(200)
    .set('Content-Type', 'application/jwt')
    .send(token)
}

function toDataMap (paths) {
  const map = {}
  for (const { domain, area, data } of paths) {
    if (!map[domain]) {
      map[domain] = {}
    }
    map[domain][area] = data
  }
  return map
}

async function write ({ payload }, res, next) {
  const connectionId = payload.sub
  const statements = payload.paths.map(({ domain, area }) =>
    getWritePermissionPdsData({
      connectionId,
      domain,
      area,
      serviceId: payload.iss
    })
  )

  const dataMap = toDataMap(payload.paths)
  const results = await multiple(statements)
  const writes = []

  if (results.every(({ rows }) => !rows.length)) {
    res.sendStatus(403).send('No valid permission')
  }

  for (const { rows } of results) {
    for (const row of rows) {
      const { pdsProvider, pdsCredentials, domain, area } = camelCase(row)
      const { outputFile } = get({ pdsProvider, pdsCredentials })

      const path = `/data/${encodeURIComponent(
        connectionId
      )}/${encodeURIComponent(domain)}/${encodeURIComponent(area)}/data.json`
      const data = dataMap[domain] && dataMap[domain][area]
      if (data) {
        writes.push(outputFile(path, JSON.stringify(data), 'utf8'))
      }
    }
  }
  await Promise.all(writes)

  res.sendStatus(200)
}

async function readRecipients ({ payload }, res, next) {
  const paths = (await getData(payload)).map(path => {
    const { domain, area } = path
    return {
      domain,
      area,
      recipients: (path.data && path.data.recipients) || undefined
    }
  })

  const token = await createRecipientsReadResponse(payload, paths)
  res
    .status(200)
    .set('Content-Type', 'application/jwt')
    .send(token)
}

module.exports = {
  read,
  readRecipients,
  write
}
