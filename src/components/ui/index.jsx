import React, { memo } from 'react'
import { motion } from 'framer-motion'
import styles from './ui.module.css'

// ─── Badge ────────────────────────────────────────────────────
export const Badge = memo(({ children, variant = 'default', size = 'sm' }) => (
  <span className={`${styles.badge} ${styles[variant]} ${styles[`badge-${size}`]}`}>
    {children}
  </span>
))

// ─── Button ──────────────────────────────────────────────────
export const Button = memo(({ children, variant = 'default', size = 'md', icon, onClick, disabled, className = '' }) => (
  <motion.button
    className={`${styles.btn} ${styles[`btn-${variant}`]} ${styles[`btn-${size}`]} ${className}`}
    onClick={onClick}
    disabled={disabled}
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
  >
    {icon && <span className={styles.btnIcon}>{icon}</span>}
    {children}
  </motion.button>
))

// ─── Card ────────────────────────────────────────────────────
export const Card = memo(({ children, className = '', hover = false, glow = false }) => (
  <motion.div
    className={`${styles.card} ${hover ? styles.cardHover : ''} ${glow ? styles.cardGlow : ''} ${className}`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28 }}
  >
    {children}
  </motion.div>
))

// ─── Skeleton ─────────────────────────────────────────────────
export const Skeleton = memo(({ width = '100%', height = '1rem', radius = '6px', className = '' }) => (
  <div
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius: radius }}
  />
))

// ─── Tag ─────────────────────────────────────────────────────
const TAG_COLORS = {
  design:     { bg: 'var(--accent-dim)', color: 'var(--accent-bright)' },
  frontend:   { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  backend:    { bg: 'var(--orange-dim)', color: 'var(--orange)' },
  testing:    { bg: 'var(--red-dim)', color: 'var(--red)' },
  devops:     { bg: 'var(--green-dim)', color: 'var(--green)' },
  ui:         { bg: 'var(--accent-dim)', color: 'var(--accent-bright)' },
  general:    { bg: 'rgba(144,144,184,0.1)', color: 'var(--text-secondary)' },
  hooks:      { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  utils:      { bg: 'var(--green-dim)', color: 'var(--green)' },
  async:      { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
  layout:     { bg: 'var(--orange-dim)', color: 'var(--orange)' },
  css:        { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  javascript: { bg: 'var(--yellow-dim)', color: 'var(--yellow)' },
  typescript: { bg: 'var(--blue-dim)', color: 'var(--blue)' },
  python:     { bg: 'var(--green-dim)', color: 'var(--green)' },
  rust:       { bg: 'var(--orange-dim)', color: 'var(--orange)' },
  go:         { bg: 'var(--blue-dim)', color: 'var(--blue)' },
}

export const Tag = memo(({ label }) => {
  const colors = TAG_COLORS[label?.toLowerCase()] || TAG_COLORS.general
  return (
    <span className={styles.tag} style={{ background: colors.bg, color: colors.color }}>
      {label}
    </span>
  )
})

// ─── Stat ────────────────────────────────────────────────────
export const StatCard = memo(({ label, value, sub, icon, color = 'var(--accent)' }) => (
  <Card className={styles.statCard} style={{ '--stat-color': color }}>
    <div className={styles.statHeader}>
      <span className={styles.statLabel}>{label}</span>
      {icon && <span className={styles.statIcon} style={{ color }}>{icon}</span>}
    </div>
    <div className={styles.statValue} style={{ color }}>{value}</div>
    {sub && <div className={styles.statSub}>{sub}</div>}
  </Card>
))

// ─── Empty State ─────────────────────────────────────────────
export const EmptyState = memo(({ icon, title, description }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>{icon}</div>
    <div className={styles.emptyTitle}>{title}</div>
    {description && <div className={styles.emptyDesc}>{description}</div>}
  </div>
))

// ─── Divider ─────────────────────────────────────────────────
export const Divider = () => <div className={styles.divider} />
