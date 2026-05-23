import React, {
  memo,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Flame,
  Target,
  Clock,
} from 'lucide-react'

import { toast } from 'sonner'

import { useInterval } from '../../hooks'

import {
  usePomodoro as usePomodoroStore,
} from '../../context/UserStoreContext'

import {
  StatCard,
  Button,
} from '../ui'

import styles from './Pomodoro.module.css'

const MODES = {
  focus: {
    label: 'Focus',
    duration: 25,
    color: 'var(--accent)',
  },

  short: {
    label: 'Short Break',
    duration: 5,
    color: 'var(--green)',
  },

  long: {
    label: 'Long Break',
    duration: 15,
    color: 'var(--blue)',
  },
}

/* Timer Ring */

const TimerRing = memo(({
  progress,
  color,
  children,
}) => {
  return (
    <div
      className={styles.timerRing}
      style={{
        '--ring-progress': progress,
        '--ring-color': color,
      }}
    >
      <div className={styles.timerInner}>
        {children}
      </div>
    </div>
  )
})


/* Pomodoro */

const Pomodoro = memo(() => {
  const {
    sessions,
    totalFocusMinutes,
    streak,
    addSession,
  } = usePomodoroStore()

  const [mode, setMode] = useState('focus')

  const [secondsLeft, setSecondsLeft] = useState(
    MODES.focus.duration * 60
  )

  const [running, setRunning] = useState(false)

  const [sessionLabel, setSessionLabel] =
    useState('Working on...')

  const currentMode = MODES[mode]

  const totalSeconds =
    currentMode.duration * 60

  const progress =
    secondsLeft / totalSeconds

  const mins = String(
    Math.floor(secondsLeft / 60)
  ).padStart(2, '0')

  const secs = String(
    secondsLeft % 60
  ).padStart(2, '0')


  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        setRunning(false)

        if (mode === 'focus') {
          addSession({
            duration: currentMode.duration,
            label: sessionLabel,
            mode,
          })

          toast.success('Focus session completed')
        }

        const newMode =
          mode === 'focus'
            ? sessions.length % 4 === 3
              ? 'long'
              : 'short'
            : 'focus'

        setTimeout(() => {
          setMode(newMode)

          setSecondsLeft(
            MODES[newMode].duration * 60
          )

          toast(
            newMode === 'focus'
              ? 'Back to focus'
              : 'Break time ☕'
          )
        }, 500)

        return 0
      }

      return prev - 1
    })
  }, [
    mode,
    currentMode.duration,
    sessionLabel,
    addSession,
    sessions.length,
  ])

  useInterval(
    tick,
    running ? 1000 : null
  )


  const handleModeChange =
    useCallback((m) => {
      setMode(m)

      setSecondsLeft(
        MODES[m].duration * 60
      )

      setRunning(false)
    }, [])

  const handleReset =
    useCallback(() => {
      setRunning(false)

      setSecondsLeft(
        currentMode.duration * 60
      )

      toast.success('Timer reset')
    }, [currentMode.duration])


  useEffect(() => {
    document.title = running
      ? `${mins}:${secs} — ${currentMode.label}`
      : 'DevPulse'

    return () => {
      document.title = 'DevPulse'
    }
  }, [
    running,
    mins,
    secs,
    currentMode.label,
  ])


  const recentSessions = useMemo(
    () => sessions.slice(0, 5),
    [sessions]
  )


  return (
    <div className={styles.wrapper}>
      {/* LEFT */}

      <div className={styles.main}>
        {/* MODES */}

        <div className={styles.modeTabs}>
          {Object.entries(MODES).map(
            ([key, m]) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  handleModeChange(key)
                }
                className={`${styles.modeBtn} ${
                  mode === key
                    ? styles.modeActive
                    : ''
                }`}
                style={
                  mode === key
                    ? {
                        '--mode-color':
                          m.color,
                      }
                    : {}
                }
              >
                {key === 'focus' ? (
                  <Flame size={14} />
                ) : (
                  <Coffee size={14} />
                )}

                {m.label}
              </motion.button>
            )
          )}
        </div>

        {/* TIMER */}

        <div className={styles.timerSection}>
          <TimerRing
            progress={progress}
            color={currentMode.color}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${mins}${secs}`}
                className={
                  styles.timeDisplay
                }
                initial={{
                  opacity: 0.4,
                  scale: 0.94,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0.4,
                  scale: 0.94,
                }}
                transition={{
                  duration: 0.14,
                }}
              >
                {mins}:{secs}
              </motion.div>
            </AnimatePresence>

            <div
              className={styles.modeLabel}
            >
              {currentMode.label}
            </div>
          </TimerRing>
        </div>

        {/* INPUT */}

        <input
          className={styles.labelInput}
          placeholder="What are you working on?"
          value={sessionLabel}
          onChange={(e) =>
            setSessionLabel(
              e.target.value
            )
          }
          maxLength={60}
        />

        {/* CONTROLS */}

        <div className={styles.controls}>
          <Button
            variant="ghost"
            size="md"
            icon={
              <RotateCcw size={15} />
            }
            onClick={handleReset}
          >
            Reset
          </Button>

          <motion.button
            className={styles.playBtn}
            style={{
              '--play-color':
                currentMode.color,
            }}
            onClick={() =>
              setRunning((r) => !r)
            }
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.96,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={
                  running
                    ? 'pause'
                    : 'play'
                }
                initial={{
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.7,
                }}
                transition={{
                  duration: 0.15,
                }}
                className={
                  styles.playIcon
                }
              >
                {running ? (
                  <Pause
                    size={18}
                    fill="currentColor"
                  />
                ) : (
                  <Play
                    size={18}
                    fill="currentColor"
                  />
                )}
              </motion.span>
            </AnimatePresence>

            {running
              ? 'Pause'
              : 'Start'}
          </motion.button>
        </div>
      </div>

      {/* RIGHT */}

      <div className={styles.sidebar}>
        <div className={styles.stats}>
          <StatCard
            label="Focus Time"
            value={`${totalFocusMinutes}m`}
            sub={`≈ ${(
              totalFocusMinutes / 60
            ).toFixed(1)}m total`}
            icon={<Clock size={16} />}
            color="var(--accent)"
          />

          <StatCard
            label="Streak"
            value={`${streak}d`}
            sub="active days"
            icon={<Flame size={16} />}
            color="var(--orange)"
          />

          <StatCard
            label="Sessions"
            value={sessions.length}
            sub="completed"
            icon={<Target size={16} />}
            color="var(--green)"
          />
        </div>

        <div className={styles.history}>
          <div
            className={styles.historyTitle}
          >
            Recent Sessions
          </div>

          {recentSessions.length === 0 ? (
            <div
              className={
                styles.emptyHistory
              }
            >
              No sessions yet
            </div>
          ) : (
            recentSessions.map((s) => (
              <div
                key={s.id}
                className={
                  styles.historyItem
                }
              >
                <div
                  className={
                    styles.historyLeft
                  }
                >
                  <span
                    className={
                      styles.historyDot
                    }
                  />

                  <span
                    className={
                      styles.historyLabel
                    }
                  >
                    {s.label}
                  </span>
                </div>

                <span
                  className={
                    styles.historyDuration
                  }
                >
                  {s.duration}m
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
})

export default Pomodoro