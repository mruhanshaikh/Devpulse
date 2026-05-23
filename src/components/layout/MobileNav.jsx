import React, { memo } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Kanban, Code2, Timer, BarChart2 } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './MobileNav.module.css'

const NAV_ITEMS = [
  { to: '/',          label: 'Home',      icon: LayoutDashboard, color: 'var(--accent)' },
  { to: '/kanban',    label: 'Kanban',    icon: Kanban,          color: 'var(--blue)' },
  { to: '/snippets',  label: 'Snippets',  icon: Code2,           color: 'var(--yellow)' },
  { to: '/focus',     label: 'Focus',     icon: Timer,           color: 'var(--pink)' },
  { to: '/analytics', label: 'Stats',     icon: BarChart2,       color: 'var(--green)' },
]

const MobileNav = memo(() => (
  <nav className={styles.nav}>
    {NAV_ITEMS.map(({ to, label, icon: Icon, color }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        style={({ isActive }) => isActive ? { '--c': color } : {}}
      >
        {({ isActive }) => (
          <>
            <motion.span
              className={styles.iconWrap}
              animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            >
              <Icon size={20} />
            </motion.span>
            <span className={styles.label}>{label}</span>
            {isActive && (
              <motion.span
                className={styles.dot}
                layoutId="mobile-nav-dot"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </>
        )}
      </NavLink>
    ))}
  </nav>
))

export default MobileNav
