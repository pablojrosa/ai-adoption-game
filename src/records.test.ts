import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBestRecord, saveRecord } from './records.ts'

describe('records fallback', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('reads the best record from localStorage when the API is unavailable', async () => {
    window.localStorage.setItem(
      'grid-collector-records-v1',
      JSON.stringify([
        {
          mode: 'time',
          durationSeconds: 30,
          coinTarget: null,
          value: 9,
        },
        {
          mode: 'time',
          durationSeconds: 30,
          coinTarget: null,
          value: 12,
        },
      ]),
    )

    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))

    await expect(fetchBestRecord('time', 30, 10)).resolves.toBe(12)
  })

  it('saves records to localStorage when the API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 503 })))

    const result = await saveRecord({
      mode: 'coin',
      durationSeconds: null,
      coinTarget: 10,
      value: 18,
    })

    expect(result).toEqual({ bestValue: 18, isNewBest: true })
    expect(window.localStorage.getItem('grid-collector-records-v1')).toContain(
      '"value":18',
    )
  })
})
