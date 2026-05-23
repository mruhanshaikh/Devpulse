import React, { memo, useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { motion } from 'framer-motion'
import { GitCommit, GitPullRequest, Star, Clock3, Lock, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  useGithubStatsGraphQL,
  useGithubRepos,
  useLanguageStats,
} from '../../data/githubQueries'
import { usePomodoro } from '../../context/UserStoreContext'
import { StatCard, Skeleton, Card, EmptyState } from '../ui'
import styles from './Analytics.module.css'

const toLocalDateKey = (d) => {
  const yyyy = d.getFullYear()
  const mm   = String(d.getMonth() + 1).padStart(2, '0')
  const dd   = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} className={styles.tooltipItem}>
          <span>{p.name}</span>
          <strong style={{ color: p.color || 'var(--accent)' }}>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

const Analytics = memo(() => {
  const { token, user } = useAuth()

  const sessions          = usePomodoro((s) => s.sessions)
  const totalFocusMinutes = usePomodoro((s) => s.totalFocusMinutes)

  const { data: stats, isLoading: loadingStats } = useGithubStatsGraphQL(token, user?.login)
  const { data: repos, isLoading: loadingRepos } = useGithubRepos(token, user?.login)
  const { data: langs, isLoading: loadingLangs } = useLanguageStats(token, user?.login)

  const isLoading = loadingStats || loadingRepos || loadingLangs

  // ── Weekly commits from GraphQL contributionCalendar ──────────────────────
  // stats.calendarHeatmap = { "YYYY-MM-DD": count } from GitHub's own calendar
  // This includes private repos and matches your profile exactly.
  const weeklyCommits = useMemo(() => {
    const arr = []
    for (let i = 6; i >= 0; i--) {
      const d   = new Date()
      d.setDate(d.getDate() - i)
      const key = toLocalDateKey(d)
      arr.push({
        day:     d.toLocaleDateString('en', { weekday: 'short' }),
        commits: stats?.calendarHeatmap?.[key] ?? 0,
        date:    d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      })
    }
    return arr
  }, [stats])

  const weeklyFocus = useMemo(() => {
    const map = {}
    sessions.forEach((s) => {
      const day = new Date(s.completedAt).toLocaleDateString('en', { weekday: 'short' })
      map[day]  = (map[day] || 0) + (s.duration || 25)
    })
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => ({
      day:     d,
      minutes: map[d] || 0,
    }))
  }, [sessions])

  const totalContributions = stats?.totalContributions || 0
  const totalStars =
    stats?.totalStars ||
    repos?.reduce((acc, r) => acc + r.stars, 0) || 0

  const productivity = useMemo(() => {
    const contributions = Math.min(totalContributions / 500,  1) * 40
    const prs           = Math.min((stats?.prsOpened || 0) / 50, 1) * 25
    const stars         = Math.min(totalStars / 200,          1) * 20
    const repoCount     = Math.min((repos?.length || 0) / 30, 1) * 10
    const focus         = Math.min(sessions.length / 30,      1) * 5
    return Math.round(contributions + prs + stars + repoCount + focus)
  }, [totalContributions, stats, totalStars, repos, sessions])

  const productivityLabel =
    productivity >= 80 ? 'Hardcore'
    : productivity >= 60 ? 'Consistent'
    : productivity >= 40 ? 'Active'
    : productivity >= 20 ? 'Beginner'
    : 'Getting Started'

  if (!token) {
    return (
      <div className={styles.emptyWrap}>
        <EmptyState
          icon="📊"
          title="Connect GitHub"
          description="Connect your GitHub account to unlock analytics dashboard"
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.skeletonGrid}>
        {[...Array(6)].map((_, i) => <Skeleton key={i} height="180px" radius="16px" />)}
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>

      <div className={styles.statRow}>
        <StatCard label="Contributions" value={stats?.totalContributions} sub="across all years"
          icon={<GitCommit size={15} />} color="var(--accent)" />
        <StatCard label="Pull Requests" value={stats?.prsOpened || 0} sub="this year"
          icon={<GitPullRequest size={15} />} color="var(--blue)" />
        <StatCard label="Stars" value={totalStars} sub="all repositories"
          icon={<Star size={15} />} color="var(--yellow)" />
        <StatCard label="Focus Time" value={`${totalFocusMinutes}m`}
          sub={`${sessions.length} completed sessions`}
          icon={<Clock3 size={15} />} color="var(--green)" />
      </div>

      <div className={styles.charts}>

        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Weekly Commits</h3>
              <p className={styles.chartSub}>Last 7 days of push activity</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyCommits}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />}
                cursor={{ fill: 'var(--accent-dim)', opacity: 0.15, radius: 6 }} />
              <Bar dataKey="commits" name="Commits" radius={[6, 6, 0, 0]}>
                {weeklyCommits.map((_, i) => (
                  <Cell key={i}
                    fill={i === weeklyCommits.length - 1 ? 'var(--accent)' : 'var(--accent-dim)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Focus Sessions</h3>
              <p className={styles.chartSub}>Minutes tracked by weekday</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyFocus}>
              <defs>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />}
                cursor={{ stroke: 'var(--green)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="minutes" name="Minutes"
                stroke="var(--green)" strokeWidth={2} fill="url(#focusGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Languages</h3>
              <p className={styles.chartSub}>Based on repositories</p>
            </div>
          </div>
          <div className={styles.langList}>
            {langs?.map((lang, i) => (
              <motion.div key={lang.name} className={styles.langRow}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}>
                <div className={styles.langTop}>
                  <div className={styles.langInfo}>
                    <span className={styles.langDot} style={{ background: lang.color }} />
                    <span className={styles.langName}>{lang.name}</span>
                  </div>
                  <span className={styles.langPercent}>{lang.percent}%</span>
                </div>
                <div className={styles.langBar}>
                  <motion.div className={styles.langBarFill}
                    style={{ width: `${lang.percent}%`, background: lang.color }}
                    initial={{ width: 0 }} animate={{ width: `${lang.percent}%` }} />
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Activity Score</h3>
              <p className={styles.chartSub}>Derived from GitHub activity</p>
            </div>
          </div>
          <div className={styles.scoreWrap}>
            <div className={styles.scoreRing}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="64" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" />
                <motion.circle cx="80" cy="80" r="64" fill="none"
                  stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                  strokeDasharray={2 * Math.PI * 64}
                  initial={{ strokeDashoffset: 2 * Math.PI * 64 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - productivity / 100) }} />
              </svg>
              <div className={styles.scoreCenter}>
                <span className={styles.scoreNumber}>{productivity}</span>
                <span className={styles.scoreLabel}>{productivityLabel}</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {repos?.length > 0 && (
        <Card className={styles.repoCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Recent Repositories</h3>
              <p className={styles.chartSub}>Latest updated projects</p>
            </div>
          </div>
          <div className={styles.repoList}>
            {repos.map((repo, i) => (
              <motion.a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer"
                className={styles.repoRow}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <div className={styles.repoInfo}>
                  <div className={styles.repoTop}>
                    {repo.isPrivate && <Lock size={11} />}
                    <span className={styles.repoName}>{repo.name}</span>
                  </div>
                  <span className={styles.repoDesc}>{repo.description || 'No description'}</span>
                </div>
                <div className={styles.repoMeta}>
                  {repo.lang && <span className={styles.repoLang}>{repo.lang}</span>}
                  <span className={styles.repoStat}>⭐ {repo.stars}</span>
                  <ExternalLink size={13} />
                </div>
              </motion.a>
            ))}
          </div>
        </Card>
      )}

    </div>
  )
})

export default Analytics