const { Client } = require('pg')
const config = require('../config')
const pgconfig = {
  host: config.get('PGHOST'),
  port: config.get('PGPORT'),
  user: config.get('PGUSER'),
  password: config.get('PGPASSWORD'),
  database: config.get('PGDATABASE')
}

const wait = (ms) => new Promise(resolve => setTimeout(() => resolve(), ms))

async function connect (attemptNo = 0) {
  try {
    const client = new Client(pgconfig)
    await client.connect()
    return client
  } catch (err) {
    console.warn(err)
    const delay = Math.min(1000 * attemptNo, 7000)
    await wait(delay)
    return connect(++attemptNo)
  }
}

async function query (sql, params = []) {
  const conn = await connect()
  try {
    const result = await conn.query(sql, params)
    return result
  } finally {
    await conn.end()
  }
}

async function multiple (queries) {
  const conn = await connect()
  try {
    const calls = queries.map((args) => conn.query(...args))
    const results = await Promise.all(calls)
    return results
  } finally {
    await conn.end()
  }
}

async function transaction (queries) {
  const conn = await connect()
  try {
    await conn.query('BEGIN')
    const results = []
    for (const args of queries) {
      const result = await conn.query(...args)
      results.push(result)
    }
    await conn.query('COMMIT')
    return results
  } catch (error) {
    console.error('transaction error, rolling back:', error)
    try {
      await conn.query('ROLLBACK')
    } catch (error) {
      console.error('rollback failed', error)
    }
    throw error
  } finally {
    await conn.end()
  }
}

module.exports = { connect, query, multiple, transaction }
