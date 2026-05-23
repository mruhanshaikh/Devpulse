import React, { createContext, useContext, useMemo, useRef } from 'react'
import { createKanbanStore, createSnippetsStore, createPomodoroStore } from '../store/userStores'

const UserStoreContext = createContext(null)

/**
 * Wraps the app once the user is authenticated.
 * Memoises store instances keyed by username — they're only created once
 * and are stable across re-renders, exactly like a normal zustand store.
 */
export function UserStoreProvider({ username, children }) {
  // Use a ref map so we don't recreate stores on every render
  const cache = useRef({})

  const stores = useMemo(() => {
    if (!cache.current[username]) {
      cache.current[username] = {
        useKanban:   createKanbanStore(username),
        useSnippets: createSnippetsStore(username),
        usePomodoro: createPomodoroStore(username),
      }
    }
    return cache.current[username]
  }, [username])

  return (
    <UserStoreContext.Provider value={stores}>
      {children}
    </UserStoreContext.Provider>
  )
}

export const useUserStores = () => {
  const ctx = useContext(UserStoreContext)
  if (!ctx) throw new Error('useUserStores must be used inside UserStoreProvider')
  return ctx
}

// Convenience hooks — components import these instead of the store directly
export const useKanban   = (selector) => useUserStores().useKanban(selector)
export const useSnippets = (selector) => useUserStores().useSnippets(selector)
export const usePomodoro = (selector) => useUserStores().usePomodoro(selector)
