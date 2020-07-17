
const { camelCase } = require('changecase-objects')
const { getWritePermissionPdsData, readPermission } = require('./sqlStatements')
const { multiple, query } = require('./adapters/postgres')
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
      const { pdsProvider, pdsCredentials, domain, area, dataPath } = camelCase(row)
      const { readFile } = get({ pdsProvider, pdsCredentials })

      const path = getDataPath({ connectionId, domain, area, dataPath })
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
  const sqlStatements = payload.paths.map(({ domain, area }) =>
    getWritePermissionPdsData({
      connectionId,
      domain,
      area,
      serviceId: payload.iss
    })
  )
  const results = await multiple(sqlStatements)
  if (results.every(({ rows }) => !rows.length)) {
    res.sendStatus(403).send('No valid permission')
  }

  const dataMap = toDataMap(payload.paths)
  const writes = []
  for (const { rows } of results) {
    for (const row of rows) {
      const { pdsProvider, pdsCredentials, domain, area, dataPath } = camelCase(row)
      const { outputFile } = get({ pdsProvider, pdsCredentials })

      const path = getDataPath({ connectionId, domain, area, dataPath })
      const data = dataMap[domain] && dataMap[domain][area]
      if (data) {
        writes.push(outputFile(path, JSON.stringify(data), 'utf8'))
      }
    }
  }
  await Promise.all(writes)

  res.sendStatus(200)
}

function getDataPath ({ connectionId, domain, area, dataPath }) {
  return '/data' +
         `/${encodeURIComponent(dataPath)}` +
         '/data.json'
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
  if (!paths.length) {
    console.error(`No data found for ${JSON.stringify(payload, null, 2)}`)
    return res.status(404)
  }
  const token = await createRecipientsReadResponse(payload, paths)
  res
    .status(200)
    .set('Content-Type', 'application/jwt')
    .send(token)
}

async function writeRecipients ({ payload }, res, next) {
  // validera att användaren har signerat meddelandet

  // hämta PDS-information för denna domain och area och connectionId, men inte serviceId?
  const { sub: connectionId, paths: [{ domain, area, recipients: updatedRecipients }] } = payload
  const sqlStatement = getWritePermissionPdsData({
    connectionId,
    domain,
    area,
    serviceId: payload.iss
  })
  const sqlResult = await query(...sqlStatement)
  if (!sqlResult.rowCount) {
    return res.status(403).send('No valid permission')
  }
  const metaData = camelCase(sqlResult)
  const permission = metaData.rows[0]
  const { readFile, outputFile } = get({ pdsProvider: permission.pdsProvider, pdsCredentials: permission.pdsCredentials })
  const path = getDataPath({ connectionId, domain, area, dataPath: permission.dataPath })

  return readFile(path, 'utf8')
    .then(data => ({
      domain,
      area,
      data: data && JSON.parse(data)
    }))
    .then(({ data }) => {
      data.recipients = updatedRecipients
      return data
    })
    .then(entry => outputFile(path, JSON.stringify(entry), 'utf8'))
    .then(() => res.sendStatus(200))
}

module.exports = {
  read,
  readRecipients,
  writeRecipients,
  write
}
