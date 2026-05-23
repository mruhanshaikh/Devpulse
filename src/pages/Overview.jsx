import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Kanban, Code2, Timer, BarChart2, Star, GitCommit, Users, Zap } from 'lucide-react'
import Heatmap from '../components/heatmap/Heatmap'
import { StatCard, Card, Skeleton, Tag, Badge } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useGithubUser, useGithubRepos, useGithubStatsGraphQL } from '../data/githubQueries'
import { useKanban, useSnippets, usePomodoro } from '../context/UserStoreContext'
import styles from './Overview.module.css'

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } },
}

const QuickLink = memo(({ to, icon: Icon, label, desc, count, color }) => (
  <Link to={to}>
    <motion.div className={styles.quickLink} whileHover={{ y: -2, borderColor: color }} transition={{ duration: 0.2 }}>
      <div className={styles.qlIcon} style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}>
        <Icon size={18} />
      </div>
      <div className={styles.qlInfo}>
        <span className={styles.qlLabel}>{label}</span>
        <span className={styles.qlDesc}>{desc}</span>
      </div>
      <div className={styles.qlRight}>
        <Badge variant="default">{count}</Badge>
        <ArrowRight size={13} className={styles.qlArrow} />
      </div>
    </motion.div>
  </Link>
))

const Overview = memo(() => {
  const { token, user: authUser } = useAuth()
  const { data: ghUser, isLoading: l1 } = useGithubUser(token, authUser?.login)
  const { data: stats, isLoading: l2 } = useGithubStatsGraphQL(token, authUser?.login)
  const { data: repos, isLoading: l3 } = useGithubRepos(token, authUser?.login)

  const columns = useKanban(s => s.columns)
  const snippets = useSnippets(s => s.snippets)
  const totalFocusMinutes = usePomodoro(s => s.totalFocusMinutes)
  const streak = usePomodoro(s => s.streak)

  const taskStats = useMemo(() => {
    const all = Object.values(columns).flatMap(c => c.tasks)
    return {
      total: all.length,
      done: columns.done?.tasks.length || 0,
      inProgress: columns.inprogress?.tasks.length || 0,
    }
  }, [columns])

  const totalStars = useMemo(() => repos?.reduce((a, r) => a + r.stars, 0) ?? 0, [repos])
  const isLoading = l1 || l2 || l3

  const displayName = ghUser?.name || ghUser?.login || authUser?.login || ''

  return (
    <motion.div className={styles.wrapper} variants={stagger.container} initial="initial" animate="animate">

      {/* Header */}
      <motion.div className={styles.header} variants={stagger.item}>
        <div>
          <h1 className={styles.title}>
            <Zap size={22} className={styles.titleIcon} />
            Welcome back, {displayName.split(' ')[0]}
          </h1>
          <p className={styles.subtitle}>
            {ghUser?.bio || `@${authUser?.login} · ${ghUser?.public_repos ?? '–'} repos · ${ghUser?.followers ?? '–'} followers`}
          </p>
        </div>
        {ghUser && (
          <a href={ghUser.html_url} target="_blank" rel="noopener noreferrer" className={styles.userBadge}>
            <img src={ghUser.avatar_url} alt={ghUser.login} className={styles.avatar} />
            <div>
              <div className={styles.username}>{ghUser.name || ghUser.login}</div>
              <div className={styles.userMeta}>{ghUser.public_repos} repos · {ghUser.followers} followers</div>
            </div>
            <ArrowRight size={13} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
          </a>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div className={styles.statRow} variants={stagger.item}>
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} height="100px" radius="12px" />)
        ) : (
          <>
            {/* totalContributions matches Heatmap's totalContributions exactly */}
            <StatCard label="Commits" value={stats?.totalCommits ?? 0} sub="across all years" icon={<GitCommit size={15} />} color="var(--accent)" />
            {/* <StatCard label="Total Stars" value={totalStars} sub="across your repos" icon={<Star size={15} />} color="var(--yellow)" /> */}
            <StatCard
              label="In Progress"
              value={taskStats.inProgress}
              sub={`${taskStats.done} task completed`}
              icon={<Kanban size={15} />}
              color="var(--blue)"
            />
            <StatCard label="Snippets" value={snippets.length} sub={`${snippets.filter(s => s.pinned).length} pinned`} icon={<Code2 size={15} />} color="var(--blue)" />
            <StatCard label="Focus Time" value={`${totalFocusMinutes}m`} sub={`${streak}d streak`} icon={<Timer size={15} />} color="var(--green)" />
          </>
        )}
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={stagger.item}>
        <Card><Heatmap /></Card>
      </motion.div>

      {/* Quick nav */}
      <motion.div variants={stagger.item}>
        <div className={styles.sectionTitle}>Workspaces</div>
        <div className={styles.quickLinks}>
          <QuickLink to="/kanban" icon={Kanban} label="Kanban Board" desc="Drag & drop tasks" count={`${taskStats.inProgress} active`} color="var(--blue)" />
          <QuickLink to="/snippets" icon={Code2} label="Snippet Vault" desc="Search & copy code" count={snippets.length} color="var(--yellow)" />
          <QuickLink to="/focus" icon={Timer} label="Focus Timer" desc="Pomodoro sessions" count={`${totalFocusMinutes}m`} color="var(--accent)" />
          <QuickLink to="/analytics" icon={BarChart2} label="Analytics" desc="GitHub stats & insights" count="live" color="var(--green)" />
        </div>
      </motion.div>

      {/* Recent repos */}
      {repos?.length > 0 && (
        <motion.div variants={stagger.item}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Recent Repositories</span>
            <a href={`https://github.com/${authUser?.login}?tab=repositories`} target="_blank" rel="noopener noreferrer" className={styles.seeAll}>
              See all <ArrowRight size={12} />
            </a>
          </div>
          <div className={styles.snippetList}>
            {repos.slice(0, 4).map(r => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.snippetRow}>
                <div className={styles.repoContent}>
                  <div className={styles.repoTop}>
                    <span className={styles.snippetName}>{r.name}</span>
                  </div>
                  <p className={styles.repoDesc}>
                    {r.description || 'No description'}
                  </p>
                </div>
                <div className={styles.snippetTags}>
                  {r.lang && <Tag label={r.lang} />}
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>⭐ {r.stars}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.updatedAt}</span>
                </div>
              </a>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent snippets */}
      {snippets.length > 0 && (
        <motion.div variants={stagger.item}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Recent Snippets</span>
            <Link to="/snippets" className={styles.seeAll}>See all <ArrowRight size={12} /></Link>
          </div>
          <div className={styles.snippetList}>
            {snippets.slice(0, 3).map(s => (
              <div key={s.id} className={styles.snippetRow}>
                <div className={styles.snippetInfo}>
                  {s.pinned && <Star size={11} className={styles.pinIcon} />}
                  <span className={styles.snippetName}>{s.title}</span>
                </div>
                <div className={styles.snippetTags}>
                  <Tag label={s.language} /><Tag label={s.tag} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
})

export default Overview