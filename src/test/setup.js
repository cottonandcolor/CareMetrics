import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = String(value) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] || null,
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

if (!globalThis.crypto?.randomUUID) {
  let counter = 0
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => `test-uuid-${++counter}`,
  }
}

beforeEach(() => {
  localStorage.clear()
})
