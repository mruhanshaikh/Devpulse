import React, { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { graphql } from '@octokit/graphql'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { Skeleton } from '../ui'
import styles from './Heatmap.module.css'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const WEEK_DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

const GITHUB_COLORS = [
  '#161b22',
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
]

const getColor = (count) => {
  if (count === 0) return GITHUB_COLORS[0]
  if (count <= 2) return GITHUB_COLORS[1]
  if (count <= 5) return GITHUB_COLORS[2]
  if (count <= 9) return GITHUB_COLORS[3]
  return GITHUB_COLORS[4]
}

const HeatmapCell = memo(({ day }) => {
  const [hovered, setHovered] = useState(false)

  const label = `${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''} on ${new Date(day.date).toLocaleDateString()}`

  return (
    <div className={styles.cellWrap}>
      <motion.div
        className={styles.day}
        style={{
          background: getColor(day.contributionCount),
        }}
        whileHover={{ scale: 1.35 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {hovered && (
        <div className={styles.tooltip}>
          {label}
        </div>
      )}
    </div>
  )
})

const fetchContributions = async (token, username, year) => {
  const from =
    year === 'all'
      ? undefined
      : `${year}-01-01T00:00:00Z`

  const to =
    year === 'all'
      ? undefined
      : `${year}-12-31T23:59:59Z`

  const query = `
    query($login: String!, $from: DateTime, $to: DateTime) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {

          contributionYears

          contributionCalendar {
            totalContributions

            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  const data = await graphql(
    query,
    {
      login: username,
      from,
      to,
      headers: {
        authorization: `token ${token}`,
      },
    }
  )

  return data.user.contributionsCollection
}

const Heatmap = memo(() => {
  const { token, user } = useAuth()

  const [selectedYear, setSelectedYear] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['github-contributions', user?.login, selectedYear],
    queryFn: () => fetchContributions(token, user?.login, selectedYear),
    enabled: !!token && !!user?.login,
  })

  const {
    weeks,
    totalContributions,
    monthLabels,
    contributionYears,
  } = useMemo(() => {

    if (!data) {
      return {
        weeks: [],
        totalContributions: 0,
        monthLabels: [],
        contributionYears: [],
      }
    }

    const calendar = data.contributionCalendar

    const labels = []
    let prevMonth = -1

    calendar.weeks.forEach((week, index) => {
      const firstDay = week.contributionDays[0]

      const month = new Date(firstDay.date).getMonth()

      if (month !== prevMonth) {
        labels.push({
          month: MONTHS[month],
          weekIndex: index,
        })

        prevMonth = month
      }
    })

    return {
      weeks: calendar.weeks,
      totalContributions: calendar.totalContributions,
      monthLabels: labels,
      contributionYears: data.contributionYears,
    }

  }, [data])

  if (isLoading) {
    return (
      <Skeleton
        width="100%"
        height="190px"
        radius="14px"
      />
    )
  }

  if (error) {
    return (
      <div className={styles.error}>
        Failed to load contribution graph
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>

      {/* HEADER */}
      <div className={styles.header}>

        <div>
          <h3 className={styles.title}>
            Contribution Activity
          </h3>

          <p className={styles.subtitle}>
            {totalContributions.toLocaleString()} contributions
            {selectedYear !== 'all' && ` in ${selectedYear}`}
          </p>
        </div>

        <select
          className={styles.yearSelect}
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">
            All Time
          </option>

          {contributionYears.map(year => (
            <option
              key={year}
              value={year}
            >
              {year}
            </option>
          ))}
        </select>

      </div>

      {/* HEATMAP */}
      <div className={styles.heatmapScroll}>

        <div className={styles.heatmapInner}>

          {/* MONTHS */}
          <div className={styles.months}>

            {monthLabels.map((m, i) => (
              <span
                key={i}
                className={styles.month}
                style={{
                  left: `calc(${m.weekIndex} * (var(--cell-size) + var(--heatmap-gap)))`,
                }}
              >
                {m.month}
              </span>
            ))}

          </div>

          <div className={styles.heatmapContent}>

            {/* WEEK LABELS */}
            <div className={styles.weekLabels}>
              {WEEK_DAYS.map((d, i) => (
                <span
                  key={i}
                  className={styles.weekDay}
                >
                  {d}
                </span>
              ))}
            </div>

            {/* GRID */}
            <div className={styles.grid}>

              {weeks.map((week, wi) => (
                <div
                  key={wi}
                  className={styles.weekCol}
                >

                  {week.contributionDays.map((day, di) => (
                    <HeatmapCell
                      key={di}
                      day={day}
                    />
                  ))}

                </div>
              ))}

            </div>

          </div>

        </div>

      </div>

      {/* FOOTER */}
      <div className={styles.footer}>

        <span>
          Less
        </span>

        <div className={styles.legend}>

          {GITHUB_COLORS.map((color, i) => (
            <div
              key={i}
              className={styles.legendDot}
              style={{
                background: color,
              }}
            />
          ))}

        </div>

        <span>
          More
        </span>

      </div>

    </div>
  )
})

export default Heatmap