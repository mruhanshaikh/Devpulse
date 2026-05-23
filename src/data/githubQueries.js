import { useQuery } from '@tanstack/react-query'
import { graphql } from '@octokit/graphql'

const GH = 'https://api.github.com'

const ghFetch = async (path, token, opts = {}) => {
  const res = await fetch(`${GH}${path}`, {
    ...opts,
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  })
  if (!res.ok) {
    const msg = await res.json().then(d => d.message).catch(() => res.statusText)
    throw new Error(`GitHub ${res.status}: ${msg}`)
  }
  return res.json()
}

const toLocalDateKey = (isoString) => {
  const d    = new Date(isoString)
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function useGithubUser(token, username) {
  return useQuery({
    queryKey: ['gh-user', username],
    queryFn: () => ghFetch(`/users/${username}`, token),
    enabled: !!token && !!username,
    staleTime: 1000 * 60 * 30,
  })
}

export function useGithubRepos(token, username) {
  return useQuery({
    queryKey: ['gh-repos', username],
    queryFn: () => ghFetch(
      `/users/${username}/repos?per_page=100&sort=pushed&type=owner`,
      token
    ),
    enabled: !!token && !!username,
    staleTime: 1000 * 60 * 10,
    select: (repos) => repos.slice(0, 6).map(r => ({
      name: r.name,
      description: r.description || '',
      stars: r.stargazers_count,
      forks: r.forks_count,
      lang: r.language || 'Unknown',
      url: r.html_url,
      updatedAt: timeAgo(r.pushed_at),
      topics: r.topics?.slice(0, 3) || [],
      isPrivate: r.private,
    })),
  })
}

export function useLanguageStats(token, username) {
  const { data: repos } = useGithubRepos(token, username)

  return useQuery({
    queryKey: ['gh-languages', username],
    queryFn: async () => {
      const counts = {}
      repos.forEach(r => {
        if (r.lang && r.lang !== 'Unknown') {
          counts[r.lang] = (counts[r.lang] || 0) + 1
        }
      })
      const total = Object.values(counts).reduce((a, b) => a + b, 0)
      const LANG_COLORS = {
        JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab',
        CSS: '#264de4', HTML: '#e34c26', Go: '#00add8', Rust: '#ce422b',
        Java: '#b07219', Ruby: '#701516', Shell: '#89e051', Vue: '#41b883',
        'C++': '#f34b7d', Swift: '#fa7343', Kotlin: '#a97bff', Dart: '#00b4ab',
        Unknown: '#555',
      }
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({
          name,
          percent: Math.round((count / total) * 100),
          color: LANG_COLORS[name] || '#8888a8',
        }))
    },
    enabled: !!repos && repos.length > 0,
    staleTime: 1000 * 60 * 15,
  })
}

// ─── Events — kept for backwards compat but heatmap now comes from GraphQL ───
export function useGithubEvents(token, username) {
  return useQuery({
    queryKey: ['gh-events', username],
    enabled: !!token && !!username,
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const pages = await Promise.allSettled([
        ghFetch(`/users/${username}/events?per_page=100&page=1`, token),
        ghFetch(`/users/${username}/events?per_page=100&page=2`, token),
        ghFetch(`/users/${username}/events?per_page=100&page=3`, token),
      ])

      const allEvents = pages.flatMap((r) =>
        r.status === 'fulfilled' ? r.value : []
      )

      const heatmap    = {}
      let totalCommits = 0
      let prsOpened    = 0
      let issuesClosed = 0

      allEvents.forEach((e) => {
        if (!e.created_at) return
        const day = toLocalDateKey(e.created_at)
        if (e.type === 'PushEvent') {
          const count = e.payload?.size ?? e.payload?.commits?.length ?? 0
          heatmap[day] = (heatmap[day] || 0) + count
          totalCommits += count
        }
        if (e.type === 'PullRequestEvent' && e.payload?.action === 'opened') prsOpened++
        if (e.type === 'IssuesEvent'      && e.payload?.action === 'closed') issuesClosed++
      })

      return { heatmap, totalCommits, prsOpened, issuesClosed }
    },
  })
}

// ─── GraphQL stats + daily contribution calendar for last 7 days ──────────────
// contributionCalendar.weeks[].contributionDays[] has REAL per-day counts
// including private repos — this is the same data shown on your GitHub profile.
export function useGithubStatsGraphQL(token, username) {
  return useQuery({
    queryKey: ['gh-stats-gql', username],
    queryFn: async () => {
      const data = await graphql(
        `
          query($login: String!) {
            user(login: $login) {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      date
                      contributionCount
                    }
                  }
                }
                totalCommitContributions
                totalPullRequestContributions
                totalIssueContributions
                restrictedContributionsCount
              }
              repositories(
                first: 100
                ownerAffiliations: OWNER
                privacy: PUBLIC
              ) {
                nodes { stargazerCount }
              }
              followers { totalCount }
              following { totalCount }
            }
          }
        `,
        {
          login: username,
          headers: { authorization: `token ${token}` },
        }
      )

      const u  = data.user
      const cc = u.contributionsCollection

      // Build heatmap from contributionCalendar — includes private repos,
      // matches exactly what GitHub profile shows
      const calendarHeatmap = {}
      cc.contributionCalendar.weeks.forEach(week => {
        week.contributionDays.forEach(day => {
          calendarHeatmap[day.date] = day.contributionCount
        })
      })

      return {
        totalContributions: cc.contributionCalendar.totalContributions,
        totalCommits:       cc.totalCommitContributions + cc.restrictedContributionsCount,
        prsOpened:          cc.totalPullRequestContributions,
        issuesClosed:       cc.totalIssueContributions,
        totalStars:         u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0),
        followers:          u.followers.totalCount,
        following:          u.following.totalCount,
        // heatmap keyed by "YYYY-MM-DD" → contribution count
        calendarHeatmap,
      }
    },
    enabled: !!token && !!username,
    staleTime: 1000 * 60 * 5,
  })
}


export function useGithubStats(token, username) {
  const { data: user }   = useGithubUser(token, username)
  const { data: repos }  = useGithubRepos(token, username)
  const { data: events } = useGithubEvents(token, username)

  return useQuery({
    queryKey: ['gh-stats', username],
    queryFn: () => ({
      totalRepos:   user?.public_repos ?? 0,
      followers:    user?.followers ?? 0,
      following:    user?.following ?? 0,
      totalStars:   repos?.reduce((a, r) => a + r.stars, 0) ?? 0,
      totalCommits: events?.totalCommits ?? 0,
      prsOpened:    events?.prsOpened ?? 0,
      issuesClosed: events?.issuesClosed ?? 0,
      codeReviews:  0,
    }),
    enabled: !!user && !!repos && !!events,
    staleTime: 1000 * 60 * 5,
  })
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 3600000)    return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000)   return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}