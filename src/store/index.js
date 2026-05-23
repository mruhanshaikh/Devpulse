import { create } from 'zustand'
import { persist } from 'zustand/middleware'

//Kanban Store
export const useKanbanStore = create(
  persist(
    (set, get) => ({
      columns: {
        todo: {
          id: 'todo',
          title: 'Backlog',
          color: 'var(--text-muted)',
          tasks: [
            { id: 't1', title: 'Design system tokens', priority: 'high', tag: 'design', createdAt: Date.now() - 86400000 * 3 },
            { id: 't2', title: 'Write unit tests for auth module', priority: 'medium', tag: 'testing', createdAt: Date.now() - 86400000 * 2 },
            { id: 't3', title: 'Refactor API layer', priority: 'low', tag: 'backend', createdAt: Date.now() - 86400000 },
          ],
        },
        inprogress: {
          id: 'inprogress',
          title: 'In Progress',
          color: 'var(--blue)',
          tasks: [
            { id: 't4', title: 'Build Kanban drag & drop', priority: 'high', tag: 'frontend', createdAt: Date.now() - 3600000 * 5 },
            { id: 't5', title: 'Integrate TanStack Query', priority: 'high', tag: 'frontend', createdAt: Date.now() - 3600000 * 2 },
          ],
        },
        review: {
          id: 'review',
          title: 'In Review',
          color: 'var(--yellow)',
          tasks: [
            { id: 't6', title: 'PR: Add dark mode toggle', priority: 'medium', tag: 'ui', createdAt: Date.now() - 3600000 * 8 },
          ],
        },
        done: {
          id: 'done',
          title: 'Done',
          color: 'var(--green)',
          tasks: [
            { id: 't7', title: 'Setup Vite project structure', priority: 'low', tag: 'devops', createdAt: Date.now() - 86400000 * 5 },
            { id: 't8', title: 'Configure ESLint & Prettier', priority: 'low', tag: 'devops', createdAt: Date.now() - 86400000 * 4 },
          ],
        },
      },
      addTask: (columnId, task) => set((state) => ({
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            tasks: [
              { id: `t${Date.now()}`, createdAt: Date.now(), priority: 'medium', tag: 'general', ...task },
              ...state.columns[columnId].tasks,
            ],
          },
        },
      })),
      moveTask: (taskId, fromCol, toCol) => set((state) => {
        const task = state.columns[fromCol].tasks.find(t => t.id === taskId)
        if (!task || fromCol === toCol) return state
        return {
          columns: {
            ...state.columns,
            [fromCol]: { ...state.columns[fromCol], tasks: state.columns[fromCol].tasks.filter(t => t.id !== taskId) },
            [toCol]: { ...state.columns[toCol], tasks: [task, ...state.columns[toCol].tasks] },
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
    { name: 'devpulse-kanban' }
  )
)

// Snippets Store 
export const useSnippetsStore = create(
  persist(
    (set, get) => ({
      snippets: [
        {
          id: 's1', title: 'useDebounce Hook', language: 'javascript', tag: 'hooks',
          code: `import { useState, useEffect } from 'react'

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}`,
          createdAt: Date.now() - 86400000 * 7,
          pinned: true,
        },
        {
          id: 's2', title: 'Fetch with AbortController', language: 'javascript', tag: 'async',
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
          createdAt: Date.now() - 86400000 * 5,
          pinned: false,
        },
        {
          id: 's3', title: 'CSS Grid Auto-fit', language: 'css', tag: 'layout',
          code: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}`,
          createdAt: Date.now() - 86400000 * 3,
          pinned: false,
        },
        {
          id: 's4', title: 'Deep Clone Utility', language: 'javascript', tag: 'utils',
          code: `const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (Array.isArray(obj)) return obj.map(deepClone)
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  )
}`,
          createdAt: Date.now() - 86400000 * 2,
          pinned: true,
        },
      ],
      addSnippet: (snippet) => set((state) => ({
        snippets: [{ id: `s${Date.now()}`, createdAt: Date.now(), pinned: false, ...snippet }, ...state.snippets],
      })),
      deleteSnippet: (id) => set((state) => ({ snippets: state.snippets.filter(s => s.id !== id) })),
      togglePin: (id) => set((state) => ({
        snippets: state.snippets.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s),
      })),
      updateSnippet: (id, updates) => set((state) => ({
        snippets: state.snippets.map(s => s.id === id ? { ...s, ...updates } : s),
      })),
    }),
    { name: 'devpulse-snippets' }
  )
)

// Pomodoro Store 
export const usePomodoroStore = create(
  persist(
    (set, get) => ({
      sessions: [],
      totalFocusMinutes: 0,
      streak: 0,
      lastSessionDate: null,
      addSession: (session) => set((state) => {
        const today = new Date().toDateString()
        const newStreak = state.lastSessionDate === today
          ? state.streak
          : state.lastSessionDate === new Date(Date.now() - 86400000).toDateString()
            ? state.streak + 1
            : 1
        return {
          sessions: [{ id: `p${Date.now()}`, ...session, completedAt: Date.now() }, ...state.sessions].slice(0, 50),
          totalFocusMinutes: state.totalFocusMinutes + (session.duration || 25),
          streak: newStreak,
          lastSessionDate: today,
        }
      }),
    }),
    { name: 'devpulse-pomodoro' }
  )
)
