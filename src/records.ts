import { createRecordQuery, type GameMode, type PersistedRecord } from './game.ts'

const RECORDS_API_PATH = '/api/records'
const RECORDS_STORAGE_KEY = 'grid-collector-records-v1'

type BestRecordResponse = {
  bestValue: number | null
}

type SaveRecordResponse = BestRecordResponse & {
  isNewBest: boolean
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && window.localStorage != null
}

function readStoredRecords() {
  if (!canUseLocalStorage()) {
    return [] as PersistedRecord[]
  }

  const rawRecords = window.localStorage.getItem(RECORDS_STORAGE_KEY)

  if (rawRecords == null) {
    return []
  }

  try {
    const parsedRecords = JSON.parse(rawRecords)

    return Array.isArray(parsedRecords)
      ? (parsedRecords as PersistedRecord[])
      : []
  } catch {
    return []
  }
}

function writeStoredRecords(records: PersistedRecord[]) {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
}

function getBestValueForQuery(
  records: PersistedRecord[],
  mode: GameMode,
  durationSeconds: number,
  coinTarget: number,
) {
  const query = createRecordQuery(mode, durationSeconds, coinTarget)
  const matchingValues = records
    .filter((record) => {
      return (
        record.mode === query.mode &&
        record.durationSeconds === query.durationSeconds &&
        record.coinTarget === query.coinTarget
      )
    })
    .map((record) => record.value)

  if (matchingValues.length === 0) {
    return null
  }

  return mode === 'time'
    ? Math.max(...matchingValues)
    : Math.min(...matchingValues)
}

function saveRecordLocally(record: PersistedRecord): SaveRecordResponse {
  const storedRecords = readStoredRecords()
  const previousBestValue =
    getBestValueForQuery(
      storedRecords,
      record.mode,
      record.durationSeconds ?? 0,
      record.coinTarget ?? 0,
    )
  const nextRecords = [...storedRecords, record]

  writeStoredRecords(nextRecords)

  const bestValue =
    getBestValueForQuery(
      nextRecords,
      record.mode,
      record.durationSeconds ?? 0,
      record.coinTarget ?? 0,
    )

  const isNewBest =
    previousBestValue == null ||
    (record.mode === 'time'
      ? record.value > previousBestValue
      : record.value < previousBestValue)

  return { bestValue, isNewBest }
}

export async function fetchBestRecord(
  mode: GameMode,
  durationSeconds: number,
  coinTarget: number,
  signal?: AbortSignal,
) {
  const query = createRecordQuery(mode, durationSeconds, coinTarget)
  const searchParams = new URLSearchParams({
    mode: query.mode,
  })

  if (query.durationSeconds != null) {
    searchParams.set('durationSeconds', String(query.durationSeconds))
  }

  if (query.coinTarget != null) {
    searchParams.set('coinTarget', String(query.coinTarget))
  }

  try {
    const response = await fetch(
      `${RECORDS_API_PATH}?${searchParams.toString()}`,
      { signal },
    )

    if (!response.ok) {
      throw new Error('Could not load the best record.')
    }

    const data = (await response.json()) as BestRecordResponse

    return data.bestValue
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw error
    }

    return getBestValueForQuery(readStoredRecords(), mode, durationSeconds, coinTarget)
  }
}

export async function saveRecord(record: PersistedRecord) {
  try {
    const response = await fetch(RECORDS_API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    })

    if (!response.ok) {
      throw new Error('Could not save the result.')
    }

    return (await response.json()) as SaveRecordResponse
  } catch (error: unknown) {
    if (isAbortError(error)) {
      throw error
    }

    return saveRecordLocally(record)
  }
}
