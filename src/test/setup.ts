import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

Object.assign(globalThis, {
  IS_REACT_ACT_ENVIRONMENT: true,
})

if (
  typeof window !== 'undefined' &&
  (window.localStorage == null ||
    typeof window.localStorage.getItem !== 'function' ||
    typeof window.localStorage.setItem !== 'function' ||
    typeof window.localStorage.clear !== 'function')
) {
  let storage = new Map<string, string>()

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      get length() {
        return storage.size
      },
      clear() {
        storage = new Map<string, string>()
      },
      getItem(key: string) {
        return storage.get(key) ?? null
      },
      key(index: number) {
        return Array.from(storage.keys())[index] ?? null
      },
      removeItem(key: string) {
        storage.delete(key)
      },
      setItem(key: string, value: string) {
        storage.set(key, String(value))
      },
    },
  })
}

afterEach(() => {
  cleanup()
})
