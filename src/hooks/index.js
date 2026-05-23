import { useState, useEffect, useCallback, useRef } from 'react'

// useDebounce 
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// useLocalStorage 
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (err) {
      console.error(err)
    }
  }, [key, storedValue])
  return [storedValue, setValue]
}

// useHeatmapData 
export function useHeatmapData() {
  return useCallback(() => {
    const data = {}
    const today = new Date()
    // Simulate realistic commit activity for 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay()
      // More activity on weekdays
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const baseChance = isWeekend ? 0.3 : 0.65
      if (Math.random() < baseChance) {
        const maxCommits = isWeekend ? 4 : 12
        data[key] = Math.floor(Math.random() * maxCommits) + 1
      } else {
        data[key] = 0
      }
    }
    return data
  }, [])
}

// useInterval 
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// useKeyPress 
export function useKeyPress(targetKey, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === targetKey) callback(e)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [targetKey, callback])
}

// useClipboard 
export function useClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), timeout)
    } catch {
      setCopied(false)
    }
  }, [timeout])
  return { copied, copy }
}
