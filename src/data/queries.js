import { useQuery } from '@tanstack/react-query'

// Simulated async fetch (mimics real API)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const generateActivityData = () => {
  const data = {}
  const today = new Date()
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().split('T')[0]
    const isWeekend = [0, 6].includes(date.getDay())
    const chance = isWeekend ? 0.3 : 0.65
    data[key] = Math.random() < chance ? Math.floor(Math.random() * (isWeekend ? 4 : 12)) + 1 : 0
  }
  return data
}

const mockGithubData = {
  user: { name: 'dev.user', username: 'devuser', followers: 248, following: 91, repos: 42 },
  stats: { totalCommits: 1247, prsOpened: 89, issuesClosed: 134, codeReviews: 67 },
  activity: generateActivityData(),
  languages: [
    { name: 'JavaScript', percent: 42, color: '#f7df1e' },
    { name: 'Python', percent: 28, color: '#3776ab' },
    { name: 'TypeScript', percent: 18, color: '#3178c6' },
    { name: 'CSS', percent: 8, color: '#264de4' },
    { name: 'Other', percent: 4, color: '#555' },
  ],
  recentRepos: [
    { name: 'devpulse', stars: 124, forks: 31, lang: 'JavaScript', updatedAt: '2h ago', description: 'Developer productivity dashboard' },
    { name: 'react-hooks-lib', stars: 89, forks: 14, lang: 'JavaScript', updatedAt: '1d ago', description: 'Collection of useful React hooks' },
    { name: 'css-grid-toolkit', stars: 67, forks: 8, lang: 'CSS', updatedAt: '3d ago', description: 'CSS Grid utility classes' },
  ],
}

const mockAnalyticsData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return {
    weeklyFocus: days.map(day => ({
      day,
      minutes: Math.floor(Math.random() * 180) + 20,
      sessions: Math.floor(Math.random() * 6) + 1,
    })),
    productivityScore: 78,
    avgFocusMinutes: 142,
    completionRate: 84,
  }
}

// TanStack Query hooks
export function useGithubStats() {
  return useQuery({
    queryKey: ['github-stats'],
    queryFn: async () => {
      await sleep(800) // simulate network
      return mockGithubData
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await sleep(600)
      return mockAnalyticsData()
    },
    staleTime: 1000 * 60 * 5,
  })
}

export function useActivityHeatmap() {
  return useQuery({
    queryKey: ['activity-heatmap'],
    queryFn: async () => {
      await sleep(400)
      return generateActivityData()
    },
    staleTime: 1000 * 60 * 30,
  })
}
