// Setup file for vitest tests
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

if (typeof window !== 'undefined') {
  window.alert = vi.fn()
}

afterEach(() => {
  cleanup()
  localStorage.clear()
})

