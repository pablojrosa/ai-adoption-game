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
    created_at TEXT NOT NULL
  )
`)

const insertRecordStatement = database.prepare(`
  INSERT INTO score_records (mode, value, created_at)
  VALUES (?, ?, ?)
`)

const selectBestTimeModeStatement = database.prepare(`
  SELECT MAX(value) AS bestRecord
  FROM score_records
  WHERE mode = 'time'
`)

const selectBestCoinModeStatement = database.prepare(`
  SELECT MIN(value) AS bestRecord
  FROM score_records
  WHERE mode = 'coin'
`)

const legacyScoresTableStatement = database.prepare(`
  SELECT name
  FROM sqlite_master
  WHERE type = 'table' AND name = 'scores'
`)

const selectTimeRecordCountStatement = database.prepare(`
  SELECT COUNT(*) AS recordCount
  FROM score_records
  WHERE mode = 'time'
`)

if (
  legacyScoresTableStatement.get() &&
  Number(selectTimeRecordCountStatement.get()?.recordCount ?? 0) === 0
) {
  database.exec(`
    INSERT INTO score_records (mode, value, created_at)
    SELECT 'time', score, created_at
    FROM scores
  `)
}

function getBestRecords() {
  const timeModeRecord = selectBestTimeModeStatement.get()
  const coinModeRecord = selectBestCoinModeStatement.get()

  return {
    timeModeBest:
      timeModeRecord?.bestRecord == null
        ? null
        : Number(timeModeRecord.bestRecord),
    coinModeBest:
      coinModeRecord?.bestRecord == null
        ? null
        : Number(coinModeRecord.bestRecord),
  }
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
    sendJson(response, 200, { bestScore: getBestRecords().timeModeBest ?? 0 })
    return
  }

  if (request.method === 'GET' && pathname === '/api/records') {
    sendJson(response, 200, { records: getBestRecords() })
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

    const previousBestRecords = getBestRecords()

    insertRecordStatement.run('time', score, new Date().toISOString())

    const records = getBestRecords()

    sendJson(response, 201, {
      records,
      isNewBest:
        previousBestRecords.timeModeBest == null ||
        score > previousBestRecords.timeModeBest,
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

    const mode = payload?.mode
    const value = payload?.value

    if (mode !== 'time' && mode !== 'coin') {
      sendJson(response, 400, { error: 'Mode must be "time" or "coin".' })
      return
    }

    if (!Number.isInteger(value) || value < 0) {
      sendJson(response, 400, {
        error: 'Value must be a non-negative integer.',
      })
      return
    }

    const previousBestRecords = getBestRecords()

    insertRecordStatement.run(mode, value, new Date().toISOString())

    const records = getBestRecords()
    const previousBestValue =
      mode === 'time'
        ? previousBestRecords.timeModeBest
        : previousBestRecords.coinModeBest

    sendJson(response, 201, {
      records,
      isNewBest:
        previousBestValue == null ||
        (mode === 'time' ? value > previousBestValue : value < previousBestValue),
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
