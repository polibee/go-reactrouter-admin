import { useSyncExternalStore } from 'react'
import { mockAuthUser } from './auth.service'
import type { AuthUser } from './auth.types'

export interface AuthStoreState {
  user: AuthUser | null
  isLoading: boolean
}

export interface AuthStore {
  subscribe: (listener: () => void) => () => void
  getState: () => AuthStoreState
  setUser: (user: AuthUser | null) => void
  setLoading: (isLoading: boolean) => void
}

export function createAuthStore(
  initialUser: AuthUser | null = mockAuthUser,
): AuthStore {
  let state: AuthStoreState = { user: initialUser, isLoading: false }
  const listeners = new Set<() => void>()
  const notify = () => {
    for (const listener of listeners) listener()
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getState: () => state,
    setUser(user) {
      state = { ...state, user }
      notify()
    },
    setLoading(isLoading) {
      state = { ...state, isLoading }
      notify()
    },
  }
}

export function useAuthStore(store: AuthStore): AuthStoreState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState)
}
