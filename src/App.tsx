import { useEffect, useState } from 'react'
import './App.css'
import {
  COIN_MODE_TARGET,
  GAME_DURATION_SECONDS,
  GRID_SIZE,
  START_POSITION,
  createRoundLayout,
  getRandomAvailablePosition,
  movePlayer,
  positionsEqual,
  type BestRecords,
  type GameMode,
  type GamePhase,
  type Position,
} from './game.ts'

type PersistedRecord = {
  mode: GameMode
  value: number
}

const EMPTY_RECORDS: BestRecords = {
  timeModeBest: null,
  coinModeBest: null,
}

async function fetchBestRecords(signal?: AbortSignal) {
  const response = await fetch('/api/records', { signal })

  if (!response.ok) {
    throw new Error('Could not load the best records.')
  }

  const data = (await response.json()) as { records: BestRecords }

  return data.records
}

async function saveRecord(record: PersistedRecord) {
  const response = await fetch('/api/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    throw new Error('Could not save the result.')
  }

  const data = (await response.json()) as {
    records: BestRecords
    isNewBest: boolean
  }

  return data
}

function getFreshRoundState() {
  const layout = createRoundLayout(START_POSITION)

  return {
    player: START_POSITION,
    score: 0,
    timeLeft: GAME_DURATION_SECONDS,
    elapsedTime: 0,
    coin: layout.coin,
    obstacle: layout.obstacle,
  }
}

const INITIAL_ROUND_STATE = getFreshRoundState()

function formatBestValue(mode: GameMode, records: BestRecords) {
  if (mode === 'time') {
    return `${records.timeModeBest ?? 0}`
  }

  return records.coinModeBest == null ? '--' : `${records.coinModeBest}s`
}

function formatModeName(mode: GameMode) {
  return mode === 'time' ? 'Time mode' : 'Coin mode'
}

function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>('time')
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [player, setPlayer] = useState<Position>(START_POSITION)
  const [score, setScore] = useState(0)
  const [bestRecords, setBestRecords] = useState<BestRecords>(EMPTY_RECORDS)
  const [bestRecordsError, setBestRecordsError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [coin, setCoin] = useState<Position>(INITIAL_ROUND_STATE.coin)
  const [obstacle, setObstacle] = useState<Position>(
    INITIAL_ROUND_STATE.obstacle,
  )
  const [pendingRecord, setPendingRecord] = useState<PersistedRecord | null>(
    null,
  )
  const [hasSubmittedRecord, setHasSubmittedRecord] = useState(false)

  const isGameActive = phase === 'playing'
  const scoreLabel = selectedMode === 'time' ? 'Score' : 'Coins'
  const bestLabel = selectedMode === 'time' ? 'Best Score' : 'Best Time'
  const timeLabel = selectedMode === 'time' ? 'Time Left' : 'Elapsed'
  const timeValue =
    selectedMode === 'time' ? `${timeLeft}s` : `${elapsedTime}s`

  function applyFreshRound() {
    const nextRound = getFreshRoundState()

    setPlayer(nextRound.player)
    setScore(nextRound.score)
    setTimeLeft(nextRound.timeLeft)
    setElapsedTime(nextRound.elapsedTime)
    setCoin(nextRound.coin)
    setObstacle(nextRound.obstacle)
    setPendingRecord(null)
    setHasSubmittedRecord(false)
  }

  function startRound() {
    applyFreshRound()
    setPhase('playing')
  }

  function resetToReady(nextMode = selectedMode) {
    setSelectedMode(nextMode)
    applyFreshRound()
    setPhase('ready')
  }

  useEffect(() => {
    const abortController = new AbortController()

    fetchBestRecords(abortController.signal)
      .then((records) => {
        setBestRecords(records)
        setBestRecordsError(null)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setBestRecordsError('Best records unavailable')
      })

    return () => abortController.abort()
  }, [])

  useEffect(() => {
    if (!isGameActive) {
      return
    }

    const timerId = window.setInterval(() => {
      if (selectedMode === 'time') {
        setTimeLeft((currentTime) => {
          if (currentTime <= 1) {
            setPhase('timeUp')
            setPendingRecord({ mode: 'time', value: score })
            return 0
          }

          return currentTime - 1
        })

        return
      }

      setElapsedTime((currentTime) => currentTime + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isGameActive, score, selectedMode])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isGameActive) {
        return
      }

      const nextPlayer = movePlayer(player, event.key)

      if (positionsEqual(nextPlayer, player)) {
        return
      }

      event.preventDefault()

      if (positionsEqual(nextPlayer, obstacle)) {
        setPlayer(nextPlayer)
        setPhase('lost')
        setPendingRecord(null)
        return
      }

      const collectedCoin = positionsEqual(nextPlayer, coin)

      setPlayer(nextPlayer)

      if (!collectedCoin) {
        return
      }

      const nextScore = score + 1
      setScore(nextScore)

      if (selectedMode === 'coin' && nextScore >= COIN_MODE_TARGET) {
        setPhase('won')
        setPendingRecord({ mode: 'coin', value: elapsedTime })
        return
      }

      setCoin(getRandomAvailablePosition([nextPlayer, obstacle]))
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [coin, elapsedTime, isGameActive, obstacle, player, score, selectedMode])

  useEffect(() => {
    if (pendingRecord == null || hasSubmittedRecord) {
      return
    }

    let isCancelled = false

    saveRecord(pendingRecord)
      .then(({ records }) => {
        if (isCancelled) {
          return
        }

        setBestRecords(records)
        setBestRecordsError(null)
      })
      .catch(() => {
        if (isCancelled) {
          return
        }

        setBestRecordsError('Best records unavailable')
      })

    setHasSubmittedRecord(true)

    return () => {
      isCancelled = true
    }
  }, [hasSubmittedRecord, pendingRecord])

  function handleModeChange(nextMode: GameMode) {
    if (isGameActive || selectedMode === nextMode) {
      return
    }

    resetToReady(nextMode)
  }

  function handlePrimaryAction() {
    if (isGameActive) {
      startRound()
      return
    }

    startRound()
  }

  const bestValue = bestRecordsError
    ? '--'
    : formatBestValue(selectedMode, bestRecords)

  let instructions =
    'Choose a mode, then start a round. Move with arrow keys or WASD.'

  if (selectedMode === 'time') {
    instructions =
      'Collect as many coins as possible in 30 seconds while avoiding the obstacle.'
  } else if (selectedMode === 'coin') {
    instructions = `Collect ${COIN_MODE_TARGET} coins as fast as possible while avoiding the obstacle.`
  }

  let footerMessage = instructions

  if (phase === 'timeUp') {
    footerMessage = `Time's up. Final score: ${score}.`
  } else if (phase === 'won') {
    footerMessage = `Target reached in ${elapsedTime}s. Final coins: ${score}.`
  } else if (phase === 'lost') {
    footerMessage = 'You hit the obstacle and lost the run.'
  }

  const primaryActionLabel =
    phase === 'ready'
      ? 'Start game'
      : isGameActive
        ? 'Restart'
        : 'Play again'

  return (
    <main className="game-shell">
      <section className="game-panel">
        <div className="game-copy">
          <p className="eyebrow">Grid Collector</p>
          <h1>{formatModeName(selectedMode)}</h1>
          <p className="instructions">{instructions}</p>
        </div>

        <div className="mode-selector" aria-label="Game mode selector">
          <button
            type="button"
            className={`mode-button${selectedMode === 'time' ? ' mode-button-active' : ''}`}
            onClick={() => handleModeChange('time')}
            disabled={isGameActive}
          >
            Time mode
          </button>
          <button
            type="button"
            className={`mode-button${selectedMode === 'coin' ? ' mode-button-active' : ''}`}
            onClick={() => handleModeChange('coin')}
            disabled={isGameActive}
          >
            Coin mode
          </button>
        </div>

        <div className="status-bar" aria-label="Game status">
          <div className="status-card">
            <span className="status-label">{scoreLabel}</span>
            <strong>{score}</strong>
          </div>
          <div className="status-card">
            <span className="status-label">{bestLabel}</span>
            <strong>{bestValue}</strong>
          </div>
          <div className="status-card">
            <span className="status-label">Player</span>
            <strong>
              {player.row + 1}, {player.col + 1}
            </strong>
          </div>
          <div className="status-card">
            <span className="status-label">{timeLabel}</span>
            <strong>{timeValue}</strong>
          </div>
        </div>

        <div
          className={`board${!isGameActive ? ' board-disabled' : ''}`}
          role="grid"
          aria-label="Grid Collector board"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const row = Math.floor(index / GRID_SIZE)
            const col = index % GRID_SIZE
            const cellPosition = { row, col }
            const isPlayer = positionsEqual(player, cellPosition)
            const isCoin = positionsEqual(coin, cellPosition)
            const isObstacle = positionsEqual(obstacle, cellPosition)

            return (
              <div
                key={`${row}-${col}`}
                className="cell"
                role="gridcell"
                aria-label={`Row ${row + 1} Column ${col + 1}`}
              >
                {isObstacle && (
                  <span className="token obstacle" aria-hidden="true" />
                )}
                {isCoin && <span className="token coin" aria-hidden="true" />}
                {isPlayer && (
                  <span className="token player" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>

        <div className="footer-bar">
          <p className="instructions">{footerMessage}</p>
          <button
            type="button"
            className="restart-button"
            onClick={handlePrimaryAction}
          >
            {primaryActionLabel}
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
