import './App.css'
import { useEffect, useState, type ChangeEvent } from 'react'
import {
  COIN_MODE_OPTIONS,
  DEFAULT_COIN_MODE_TARGET,
  DEFAULT_TIME_MODE_SECONDS,
  GRID_SIZE,
  START_POSITION,
  TIME_MODE_OPTIONS,
  createRecordQuery,
  createRoundLayout,
  getRandomAvailablePosition,
  movePlayer,
  positionsEqual,
  type GameMode,
  type GamePhase,
  type PersistedRecord,
  type Position,
} from './game.ts'

async function fetchBestRecord(
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

  const response = await fetch(`/api/records?${searchParams.toString()}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error('Could not load the best record.')
  }

  const data = (await response.json()) as { bestValue: number | null }

  return data.bestValue
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
    bestValue: number | null
    isNewBest: boolean
  }

  return data
}

function getFreshRoundState(timeModeSeconds: number) {
  const layout = createRoundLayout(START_POSITION)

  return {
    player: START_POSITION,
    score: 0,
    timeLeft: timeModeSeconds,
    elapsedTime: 0,
    coin: layout.coin,
    obstacle: layout.obstacle,
  }
}

function formatModeName(mode: GameMode) {
  return mode === 'time' ? 'Time mode' : 'Coin mode'
}

function formatBestValue(mode: GameMode, bestValue: number | null) {
  if (bestValue == null) {
    return mode === 'time' ? 'No record yet' : 'No record yet'
  }

  return mode === 'time' ? `${bestValue}` : `${bestValue}s`
}

function App() {
  const [selectedMode, setSelectedMode] = useState<GameMode>('time')
  const [timeModeSeconds, setTimeModeSeconds] = useState(
    DEFAULT_TIME_MODE_SECONDS,
  )
  const [coinModeTarget, setCoinModeTarget] = useState(
    DEFAULT_COIN_MODE_TARGET,
  )
  const [phase, setPhase] = useState<GamePhase>('ready')
  const initialRoundState = getFreshRoundState(timeModeSeconds)
  const [player, setPlayer] = useState<Position>(initialRoundState.player)
  const [score, setScore] = useState(initialRoundState.score)
  const [bestValue, setBestValue] = useState<number | null>(null)
  const [bestRecordError, setBestRecordError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(initialRoundState.timeLeft)
  const [elapsedTime, setElapsedTime] = useState(initialRoundState.elapsedTime)
  const [coin, setCoin] = useState<Position>(initialRoundState.coin)
  const [obstacle, setObstacle] = useState<Position>(initialRoundState.obstacle)
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

  function applyFreshRound(durationSeconds = timeModeSeconds) {
    const nextRound = getFreshRoundState(durationSeconds)

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

  useEffect(() => {
    const abortController = new AbortController()

    fetchBestRecord(
      selectedMode,
      timeModeSeconds,
      coinModeTarget,
      abortController.signal,
    )
      .then((nextBestValue) => {
        setBestValue(nextBestValue)
        setBestRecordError(null)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setBestRecordError('Best record unavailable')
      })

    return () => abortController.abort()
  }, [coinModeTarget, selectedMode, timeModeSeconds])

  useEffect(() => {
    if (!isGameActive) {
      return
    }

    const timerId = window.setInterval(() => {
      if (selectedMode === 'time') {
        setTimeLeft((currentTime) => {
          if (currentTime <= 1) {
            setPhase('timeUp')
            setPendingRecord({
              ...createRecordQuery(selectedMode, timeModeSeconds, coinModeTarget),
              value: score,
            })
            return 0
          }

          return currentTime - 1
        })

        return
      }

      setElapsedTime((currentTime) => currentTime + 1)
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [coinModeTarget, isGameActive, score, selectedMode, timeModeSeconds])

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

      if (selectedMode === 'coin' && nextScore >= coinModeTarget) {
        const completionTime = elapsedTime + 1

        setElapsedTime(completionTime)
        setPhase('won')
        setPendingRecord({
          ...createRecordQuery(selectedMode, timeModeSeconds, coinModeTarget),
          value: completionTime,
        })
        return
      }

      const nextObstacle = getRandomAvailablePosition([nextPlayer])
      const nextCoin = getRandomAvailablePosition([nextPlayer, nextObstacle])

      setObstacle(nextObstacle)
      setCoin(nextCoin)
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    coin,
    coinModeTarget,
    elapsedTime,
    isGameActive,
    obstacle,
    player,
    score,
    selectedMode,
    timeModeSeconds,
  ])

  useEffect(() => {
    if (pendingRecord == null || hasSubmittedRecord) {
      return
    }

    let isCancelled = false

    saveRecord(pendingRecord)
      .then(({ bestValue: nextBestValue }) => {
        if (isCancelled) {
          return
        }

        setBestValue(nextBestValue)
        setBestRecordError(null)
      })
      .catch(() => {
        if (isCancelled) {
          return
        }

        setBestRecordError('Best record unavailable')
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

    setSelectedMode(nextMode)
    applyFreshRound()
    setPhase('ready')
  }

  function handleTimeModeDurationChange(event: ChangeEvent<HTMLSelectElement>) {
    if (isGameActive) {
      return
    }

    const nextDuration = Number(event.target.value)

    setTimeModeSeconds(nextDuration)
    applyFreshRound(nextDuration)
    setPhase('ready')
  }

  function handleCoinModeTargetChange(event: ChangeEvent<HTMLSelectElement>) {
    if (isGameActive) {
      return
    }

    setCoinModeTarget(Number(event.target.value))
    applyFreshRound()
    setPhase('ready')
  }

  let instructions =
    'Choose a mode, adjust its settings, then start a round. Move with arrow keys or WASD.'

  if (selectedMode === 'time') {
    instructions = `Collect as many coins as possible in ${timeModeSeconds} seconds while avoiding the obstacle.`
  } else if (selectedMode === 'coin') {
    instructions = `Collect ${coinModeTarget} coins as fast as possible while avoiding the obstacle.`
  }

  let footerMessage = instructions
  let resultToneClass = 'result-banner-neutral'

  if (phase === 'timeUp') {
    footerMessage = `Time's up. Final score: ${score}.`
    resultToneClass = 'result-banner-success'
  } else if (phase === 'won') {
    footerMessage = `Target reached in ${elapsedTime}s. Final coins: ${score}.`
    resultToneClass = 'result-banner-success'
  } else if (phase === 'lost') {
    footerMessage = 'You hit the obstacle and lost the run.'
    resultToneClass = 'result-banner-loss'
  }

  const bestDisplayValue = bestRecordError
    ? 'Record unavailable'
    : formatBestValue(selectedMode, bestValue)

  const modeGoalText =
    selectedMode === 'time'
      ? `Goal: survive ${timeModeSeconds}s and collect as many coins as possible.`
      : `Goal: collect ${coinModeTarget} coins in the least time possible.`

  const modeRecordText =
    bestRecordError == null
      ? `Best for this setup: ${formatBestValue(selectedMode, bestValue)}`
      : 'Best for this setup: Record unavailable'

  const primaryActionLabel = phase === 'ready' ? 'Start game' : 'Play again'

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

        <div className="mode-config" aria-label="Mode settings">
          {selectedMode === 'time' ? (
            <label className="config-field" htmlFor="time-mode-seconds">
              <span className="status-label">Seconds to Play</span>
              <select
                id="time-mode-seconds"
                className="config-select"
                value={timeModeSeconds}
                onChange={handleTimeModeDurationChange}
                disabled={isGameActive}
              >
                {TIME_MODE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} seconds
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="config-field" htmlFor="coin-mode-target">
              <span className="status-label">Coins to Collect</span>
              <select
                id="coin-mode-target"
                className="config-select"
                value={coinModeTarget}
                onChange={handleCoinModeTargetChange}
                disabled={isGameActive}
              >
                {COIN_MODE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} coins
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="config-summary">
            <p className="config-summary-line">{modeGoalText}</p>
            <p className="config-summary-line">{modeRecordText}</p>
          </div>
        </div>

        <div className="status-bar" aria-label="Game status">
          <div className="status-card">
            <span className="status-label">{scoreLabel}</span>
            <strong>{score}</strong>
          </div>
          <div className="status-card">
            <span className="status-label">{bestLabel}</span>
            <strong>{bestDisplayValue}</strong>
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
          <p className={`result-banner ${resultToneClass}`}>{footerMessage}</p>
          <button
            type="button"
            className="restart-button"
            onClick={startRound}
          >
            {primaryActionLabel}
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
