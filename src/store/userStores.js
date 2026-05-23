/**
 * Per-user store factory.
 * Each store key is prefixed with the GitHub username so that
 * ruhan and ayan on the same browser never share data.
 *
 * Usage:
 *   const useKanban  = createKanbanStore('alice')
 *   const useSnippets = createSnippetsStore('alice')
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Kanban 
const DEFAULT_COLUMNS = (username) => ({
  todo: {
    id: 'todo', title: 'Backlog', color: 'var(--text-muted)',
    tasks: [
      { id: `${username}-t1`, title: 'Explore DevPulse features', priority: 'high', tag: 'general', createdAt: Date.now() },
      { id: `${username}-t2`, title: 'Add your first snippet', priority: 'medium', tag: 'frontend', createdAt: Date.now() - 60000 },
    ],
  },
  inprogress: {
    id: 'inprogress', title: 'In Progress', color: 'var(--blue)',
    tasks: [
      { id: `${username}-t3`, title: 'Set up project structure', priority: 'high', tag: 'devops', createdAt: Date.now() - 120000 },
    ],
  },
  review: {
    id: 'review', title: 'In Review', color: 'var(--yellow)',
    tasks: [],
  },
  done: {
    id: 'done', title: 'Done', color: 'var(--green)',
    tasks: [
      { id: `${username}-t4`, title: `Log in as @${username} 🎉`, priority: 'low', tag: 'general', createdAt: Date.now() - 180000 },
    ],
  },
})

export const createKanbanStore = (username) =>
  create(
    persist(
      (set) => ({
        columns: DEFAULT_COLUMNS(username),

        addTask: (columnId, task) => set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: {
              ...state.columns[columnId],
              tasks: [
                { id: `${username}-${Date.now()}`, createdAt: Date.now(), priority: 'medium', tag: 'general', ...task },
                ...state.columns[columnId].tasks,
              ],
            },
          },
        })),

        moveTask: (taskId, fromCol, toCol) => set((state) => {
          if (fromCol === toCol) return state
          const task = state.columns[fromCol].tasks.find(t => t.id === taskId)
          if (!task) return state
          return {
            columns: {
              ...state.columns,
              [fromCol]: { ...state.columns[fromCol], tasks: state.columns[fromCol].tasks.filter(t => t.id !== taskId) },
              [toCol]:   { ...state.columns[toCol],   tasks: [task, ...state.columns[toCol].tasks] },
            },
          }
        }),

        deleteTask: (taskId, columnId) => set((state) => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], tasks: state.columns[columnId].tasks.filter(t => t.id !== taskId) },
          },
        })),
      }),
      { name: `devpulse-kanban-${username}` }
    )
  )

// Snippets 
const DEFAULT_SNIPPETS = (username) => [
  {
    id: `${username}-s1`, title: 'useDebounce Hook', language: 'javascript', tag: 'hooks', pinned: true,
    createdAt: Date.now() - 86400000,
    code: `import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}`,
  },
  {
    id: `${username}-s2`, title: 'Fetch with AbortController', language: 'javascript', tag: 'async', pinned: false,
    createdAt: Date.now() - 43200000,
    code: `async function fetchWithAbort(url, signal) {
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`)
    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') return null
    throw err
  }
}`,
  },
]

export const createSnippetsStore = (username) =>
  create(
    persist(
      (set) => ({
        snippets: DEFAULT_SNIPPETS(username),

        addSnippet: (snippet) => set((state) => ({
          snippets: [
            { id: `${username}-${Date.now()}`, createdAt: Date.now(), pinned: false, ...snippet },
            ...state.snippets,
          ],
        })),

        deleteSnippet: (id) => set((state) => ({
          snippets: state.snippets.filter(s => s.id !== id),
        })),

        togglePin: (id) => set((state) => ({
          snippets: state.snippets.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s),
        })),

        updateSnippet: (id, updates) => set((state) => ({
          snippets: state.snippets.map(s => s.id === id ? { ...s, ...updates } : s),
        })),
      }),
      { name: `devpulse-snippets-${username}` }
    )
  )

// Pomodoro
export const createPomodoroStore = (username) =>
  create(
    persist(
      (set) => ({
        sessions: [],
        totalFocusMinutes: 0,
        streak: 0,
        lastSessionDate: null,

        addSession: (session) => set((state) => {
          const today = new Date().toDateString()
          const yesterday = new Date(Date.now() - 86400000).toDateString()
          const newStreak =
            state.lastSessionDate === today     ? state.streak :
            state.lastSessionDate === yesterday ? state.streak + 1 : 1
          return {
            sessions: [{ id: `${username}-p${Date.now()}`, ...session, completedAt: Date.now() }, ...state.sessions].slice(0, 50),
            totalFocusMinutes: state.totalFocusMinutes + (session.duration || 25),
            streak: newStreak,
            lastSessionDate: today,
          }
        }),
      }),
      { name: `devpulse-pomodoro-${username}` }
    )
  )
