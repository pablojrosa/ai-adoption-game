export const GRID_SIZE = 10
export const GAME_DURATION_SECONDS = 30
export const COIN_MODE_TARGET = 10

export type Position = {
  row: number
  col: number
}

export type GameMode = 'time' | 'coin'

export type GamePhase = 'ready' | 'playing' | 'timeUp' | 'won' | 'lost'

export type BestRecords = {
  timeModeBest: number | null
  coinModeBest: number | null
}

export const START_POSITION: Position = { row: 0, col: 0 }

export function positionsEqual(first: Position, second: Position) {
  return first.row === second.row && first.col === second.col
}

export function movePlayer(player: Position, key: string): Position {
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

export function getRandomAvailablePosition(excludedPositions: Position[]) {
  const availableCells: Position[] = []

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const candidate = { row, col }

      if (excludedPositions.some((position) => positionsEqual(position, candidate))) {
        continue
      }

      availableCells.push(candidate)
    }
  }

  return availableCells[Math.floor(Math.random() * availableCells.length)]
}

export function createRoundLayout(player: Position) {
  const obstacle = getRandomAvailablePosition([player])
  const coin = getRandomAvailablePosition([player, obstacle])

  return { coin, obstacle }
}
