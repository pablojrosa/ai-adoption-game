import { createServer } from 'node:http'
import { mkdirSync, existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const dataDir = path.join(projectRoot, 'data')
const databasePath = path.join(dataDir, 'game.db')
const distDir = path.join(projectRoot, 'dist')
const port = Number(process.env.PORT ?? 3001)

mkdirSync(dataDir, { recursive: true })

const database = new DatabaseSync(databasePath)

database.exec(`
  CREATE TABLE IF NOT EXISTS score_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK(mode IN ('time', 'coin')),
    value INTEGER NOT NULL,
    duration_seconds INTEGER,
    coin_target INTEGER,
    created_at TEXT NOT NULL
  )
`)

database.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )
`)

const scoreRecordColumns = database
  .prepare(`PRAGMA table_info(score_records)`)
  .all()
  .map((column) => String(column.name))

if (!scoreRecordColumns.includes('duration_seconds')) {
  database.exec(`
    ALTER TABLE score_records
    ADD COLUMN duration_seconds INTEGER
  `)
}

if (!scoreRecordColumns.includes('coin_target')) {
  database.exec(`
    ALTER TABLE score_records
    ADD COLUMN coin_target INTEGER
  `)
}

database.exec(`
  UPDATE score_records
  SET duration_seconds = 30
  WHERE mode = 'time' AND duration_seconds IS NULL
`)

database.exec(`
  UPDATE score_records
  SET coin_target = 10
  WHERE mode = 'coin' AND coin_target IS NULL
`)

const insertRecordStatement = database.prepare(`
  INSERT INTO score_records (
    mode,
    value,
    duration_seconds,
    coin_target,
    created_at
  )
  VALUES (?, ?, ?, ?, ?)
`)

const countLegacyTimeRecordsStatement = database.prepare(`
  SELECT COUNT(*) AS recordCount
  FROM score_records
  WHERE mode = 'time' AND duration_seconds = 30
`)

if (Number(countLegacyTimeRecordsStatement.get()?.recordCount ?? 0) === 0) {
  database.exec(`
    INSERT INTO score_records (
      mode,
      value,
      duration_seconds,
      coin_target,
      created_at
    )
    SELECT
      'time',
      score,
      30,
      NULL,
      created_at
    FROM scores
  `)
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
  })
  response.end(message)
}

function getContentType(filePath) {
  const extension = path.extname(filePath)

  switch (extension) {
    case '.css':
      return 'text/css; charset=utf-8'
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.png':
      return 'image/png'
    case '.svg':
      return 'image/svg+xml'
    case '.gif':
      return 'image/gif'
    case '.ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}

async function readRequestBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

function parseOptionalInteger(value) {
  if (value == null || value === '') {
    return null
  }

  const parsedValue = Number(value)

  return Number.isInteger(parsedValue) ? parsedValue : Number.NaN
}

function normalizeRecordQuery(source) {
  const mode = source.mode
  const durationSeconds = parseOptionalInteger(source.durationSeconds)
  const coinTarget = parseOptionalInteger(source.coinTarget)

  if (mode !== 'time' && mode !== 'coin') {
    return { error: 'Mode must be "time" or "coin".' }
  }

  if (
    (durationSeconds !== null && Number.isNaN(durationSeconds)) ||
    (coinTarget !== null && Number.isNaN(coinTarget))
  ) {
    return { error: 'Record settings must be integers when provided.' }
  }

  if (mode === 'time' && (durationSeconds == null || durationSeconds <= 0)) {
    return { error: 'Time mode requires a positive durationSeconds value.' }
  }

  if (mode === 'coin' && (coinTarget == null || coinTarget <= 0)) {
    return { error: 'Coin mode requires a positive coinTarget value.' }
  }

  return {
    mode,
    durationSeconds: mode === 'time' ? durationSeconds : null,
    coinTarget: mode === 'coin' ? coinTarget : null,
  }
}

function getBestRecord(query) {
  const { mode, durationSeconds, coinTarget } = query

  const statement =
    mode === 'time'
      ? database.prepare(`
          SELECT MAX(value) AS bestValue
          FROM score_records
          WHERE mode = 'time' AND duration_seconds = ?
        `)
      : database.prepare(`
          SELECT MIN(value) AS bestValue
          FROM score_records
          WHERE mode = 'coin' AND coin_target = ?
        `)

  const parameter = mode === 'time' ? durationSeconds : coinTarget
  const result = statement.get(parameter)

  return result?.bestValue == null ? null : Number(result.bestValue)
}

function isNewBestRecord(mode, value, currentBest) {
  if (currentBest == null) {
    return true
  }

  return mode === 'time' ? value > currentBest : value < currentBest
}

async function serveStaticAsset(response, requestPath) {
  const relativePath =
    requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, '')
  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, '')
  const filePath = path.join(distDir, safePath)

  try {
    const fileContents = await readFile(filePath)

    response.writeHead(200, {
      'Content-Type': getContentType(filePath),
    })
    response.end(fileContents)
    return true
  } catch {
    return false
  }
}

async function requestHandler(request, response) {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host}`)
  const { pathname } = requestUrl

  if (request.method === 'GET' && pathname === '/api/high-score') {
    const bestValue = getBestRecord({
      mode: 'time',
      durationSeconds: 30,
      coinTarget: null,
    })

    sendJson(response, 200, { bestScore: bestValue ?? 0 })
    return
  }

  if (request.method === 'GET' && pathname === '/api/records') {
    const query = normalizeRecordQuery({
      mode: requestUrl.searchParams.get('mode'),
      durationSeconds: requestUrl.searchParams.get('durationSeconds'),
      coinTarget: requestUrl.searchParams.get('coinTarget'),
    })

    if ('error' in query) {
      sendJson(response, 400, { error: query.error })
      return
    }

    sendJson(response, 200, { bestValue: getBestRecord(query) })
    return
  }

  if (request.method === 'POST' && pathname === '/api/scores') {
    const rawBody = await readRequestBody(request)

    let payload

    try {
      payload = JSON.parse(rawBody)
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON.' })
      return
    }

    const score = payload?.score

    if (!Number.isInteger(score) || score < 0) {
      sendJson(response, 400, {
        error: 'Score must be a non-negative integer.',
      })
      return
    }

    const legacyQuery = {
      mode: 'time',
      durationSeconds: 30,
      coinTarget: null,
    }
    const previousBestValue = getBestRecord(legacyQuery)

    insertRecordStatement.run('time', score, 30, null, new Date().toISOString())

    sendJson(response, 201, {
      bestValue: getBestRecord(legacyQuery),
      isNewBest: isNewBestRecord('time', score, previousBestValue),
    })
    return
  }

  if (request.method === 'POST' && pathname === '/api/records') {
    const rawBody = await readRequestBody(request)

    let payload

    try {
      payload = JSON.parse(rawBody)
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON.' })
      return
    }

    const query = normalizeRecordQuery(payload)

    if ('error' in query) {
      sendJson(response, 400, { error: query.error })
      return
    }

    const value = payload?.value

    if (!Number.isInteger(value) || value < 0) {
      sendJson(response, 400, {
        error: 'Value must be a non-negative integer.',
      })
      return
    }

    const previousBestValue = getBestRecord(query)

    insertRecordStatement.run(
      query.mode,
      value,
      query.durationSeconds,
      query.coinTarget,
      new Date().toISOString(),
    )

    sendJson(response, 201, {
      bestValue: getBestRecord(query),
      isNewBest: isNewBestRecord(query.mode, value, previousBestValue),
    })
    return
  }

  if (pathname.startsWith('/api/')) {
    sendJson(response, 404, { error: 'Endpoint not found.' })
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendText(response, 405, 'Method not allowed.')
    return
  }

  if (!existsSync(distDir)) {
    sendText(
      response,
      200,
      'Frontend build not found. Run "npm run dev" for development or "npm run build" before "npm run start".',
    )
    return
  }

  const assetServed = await serveStaticAsset(response, pathname)

  if (assetServed) {
    return
  }

  const indexFilePath = path.join(distDir, 'index.html')

  try {
    const indexHtml = await readFile(indexFilePath)

    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
    })
    response.end(indexHtml)
  } catch {
    sendText(response, 500, 'Could not load frontend build.')
  }
}

const server = createServer((request, response) => {
  requestHandler(request, response).catch((error) => {
    console.error(error)
    sendJson(response, 500, { error: 'Unexpected server error.' })
  })
})

server.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`)
  console.log(`SQLite database: ${databasePath}`)
})
