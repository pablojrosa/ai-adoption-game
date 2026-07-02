import { describe, expect, it, vi } from 'vitest'
import {
  GRID_SIZE,
  START_POSITION,
  createRecordQuery,
  createRoundLayout,
  getRandomAvailablePosition,
  movePlayer,
} from './game.ts'

describe('movePlayer', () => {
  it('keeps the player inside the board bounds', () => {
    expect(movePlayer(START_POSITION, 'ArrowUp')).toEqual(START_POSITION)
    expect(movePlayer(START_POSITION, 'ArrowLeft')).toEqual(START_POSITION)

    const edge = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 }

    expect(movePlayer(edge, 'ArrowDown')).toEqual(edge)
    expect(movePlayer(edge, 'ArrowRight')).toEqual(edge)
  })

  it('supports arrow keys and WASD movement', () => {
    const position = { row: 5, col: 5 }

    expect(movePlayer(position, 'w')).toEqual({ row: 4, col: 5 })
    expect(movePlayer(position, 'A')).toEqual({ row: 5, col: 4 })
    expect(movePlayer(position, 's')).toEqual({ row: 6, col: 5 })
    expect(movePlayer(position, 'D')).toEqual({ row: 5, col: 6 })
  })
})

describe('getRandomAvailablePosition', () => {
  it('never returns an excluded cell', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    const position = getRandomAvailablePosition([START_POSITION])

    expect(position).toEqual({ row: 0, col: 1 })
  })
})

describe('createRoundLayout', () => {
  it('places the coin and obstacle away from the player and each other', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)

    const layout = createRoundLayout(START_POSITION)

    expect(layout.obstacle).toEqual({ row: 0, col: 1 })
    expect(layout.coin).toEqual({ row: 0, col: 2 })
  })
})

describe('createRecordQuery', () => {
  it('returns mode-specific record settings', () => {
    expect(createRecordQuery('time', 45, 10)).toEqual({
      mode: 'time',
      durationSeconds: 45,
      coinTarget: null,
    })

    expect(createRecordQuery('coin', 45, 15)).toEqual({
      mode: 'coin',
      durationSeconds: null,
      coinTarget: 15,
    })
  })
})
