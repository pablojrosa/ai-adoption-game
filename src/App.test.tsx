import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.tsx'

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function installFetchMock(options?: {
  bestValue?: number | null
  savedBestValue?: number | null
}) {
  const { bestValue = null, savedBestValue = null } = options ?? {}

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

    if (url.startsWith('/api/records?')) {
      return jsonResponse({ bestValue })
    }

    if (url === '/api/records' && init?.method === 'POST') {
      return jsonResponse({ bestValue: savedBestValue, isNewBest: true })
    }

    throw new Error(`Unexpected fetch request: ${url}`)
  })

  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

describe('App harness', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('loads the default time-mode record and starts a round', async () => {
    const fetchMock = installFetchMock({ bestValue: 7 })

    vi.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/records?mode=time&durationSeconds=30',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })

    expect(
      screen.getAllByText(
        'Collect as many coins as possible in 30 seconds while avoiding the obstacle.',
      ),
    ).toHaveLength(2)
    expect(screen.getByText('Goal: survive 30s and collect as many coins as possible.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Start game' }))

    expect(screen.getByRole('button', { name: 'Time mode' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Coin mode' })).toBeDisabled()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('ends the run on obstacle collision without saving a record', async () => {
    const fetchMock = installFetchMock()

    vi.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Start game' }))
    fireEvent.keyDown(window, { key: 'ArrowRight' })

    expect(
      screen.getByText('You hit the obstacle and lost the run.'),
    ).toBeInTheDocument()
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false)
  })

  it('switches to coin mode and loads the mode-specific record query', async () => {
    const fetchMock = installFetchMock()

    vi.spyOn(Math, 'random').mockReturnValue(0)

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Coin mode' }))

    expect(
      screen.getAllByText(
        'Collect 10 coins as fast as possible while avoiding the obstacle.',
      ),
    ).toHaveLength(2)
    expect(
      screen.getByText('Goal: collect 10 coins in the least time possible.'),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/records?mode=coin&coinTarget=10',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })
  })
})
