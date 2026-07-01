import { useEffect, useState } from 'react'
import './App.css'

const GRID_SIZE = 10
const GAME_DURATION_SECONDS = 30

type Position = {
  row: number
  col: number
}

const START_POSITION: Position = { row: 0, col: 0 }

function getRandomCoinPosition(player: Position): Position {
  const availableCells: Position[] = []

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (row === player.row && col === player.col) {
        continue
      }

      availableCells.push({ row, col })
    }
  }

  return availableCells[Math.floor(Math.random() * availableCells.length)]
}

function movePlayer(player: Position, key: string): Position {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return { ...player, row: Math.max(0, player.row - 1) }
    case 'ArrowDown':
    case 's':
    case 'S':
      return { ...player, row: Math.min(GRID_SIZE - 1, player.row + 1) }
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return { ...player, col: Math.max(0, player.col - 1) }
    case 'ArrowRight':
    case 'd':
    case 'D':
      return { ...player, col: Math.min(GRID_SIZE - 1, player.col + 1) }
    default:
      return player
  }
}

function App() {
  const [player, setPlayer] = useState<Position>(START_POSITION)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS)
  const [coin, setCoin] = useState<Position>(() =>
    getRandomCoinPosition(START_POSITION),
  )
  const isGameOver = timeLeft === 0

  function restartGame() {
    setPlayer(START_POSITION)
    setScore(0)
    setTimeLeft(GAME_DURATION_SECONDS)
    setCoin(getRandomCoinPosition(START_POSITION))
  }

  useEffect(() => {
    if (isGameOver) {
      return
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((currentTime) => Math.max(0, currentTime - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isGameOver])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isGameOver) {
        return
      }

      const nextPlayer = movePlayer(player, event.key)

      if (nextPlayer === player) {
        return
      }

      event.preventDefault()

      const collectedCoin =
        nextPlayer.row === coin.row && nextPlayer.col === coin.col

      setPlayer(nextPlayer)

      if (collectedCoin) {
        setScore((currentScore) => currentScore + 1)
        setCoin(getRandomCoinPosition(nextPlayer))
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [player, coin, isGameOver])

  return (
    <main className="game-shell">
      <section className="game-panel">
        <div className="game-copy">
          <p className="eyebrow">Grid Collector</p>
          <h1>Collect the coin before it jumps again.</h1>
          <p className="instructions">
            Move with arrow keys or WASD inside the 10x10 grid before the timer
            runs out.
          </p>
        </div>

        <div className="status-bar" aria-label="Game status">
          <div className="status-card">
            <span className="status-label">Score</span>
            <strong>{score}</strong>
          </div>
          <div className="status-card">
            <span className="status-label">Player</span>
            <strong>
              {player.row + 1}, {player.col + 1}
            </strong>
          </div>
          <div className="status-card">
            <span className="status-label">Time</span>
            <strong>{timeLeft}s</strong>
          </div>
        </div>

        <div
          className={`board${isGameOver ? ' board-disabled' : ''}`}
          role="grid"
          aria-label="Grid Collector board"
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const row = Math.floor(index / GRID_SIZE)
            const col = index % GRID_SIZE
            const isPlayer = player.row === row && player.col === col
            const isCoin = coin.row === row && coin.col === col

            return (
              <div
                key={`${row}-${col}`}
                className="cell"
                role="gridcell"
                aria-label={`Row ${row + 1} Column ${col + 1}`}
              >
                {isCoin && <span className="token coin" aria-hidden="true" />}
                {isPlayer && (
                  <span className="token player" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>

        <div className="footer-bar">
          <p className="instructions">
            {isGameOver
              ? `Time's up. Final score: ${score}.`
              : 'Collect as many coins as you can in 30 seconds.'}
          </p>
          <button type="button" className="restart-button" onClick={restartGame}>
            {isGameOver ? 'Play again' : 'Restart'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
