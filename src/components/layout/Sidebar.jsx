import React, { memo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Kanban, Code2, Timer,
  BarChart2, ChevronLeft, ChevronRight, Zap, LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

const NAV_ITEMS = [
  { to: '/',          label: 'Overview',  icon: LayoutDashboard, color: 'var(--accent)' },
  { to: '/kanban',    label: 'Kanban',    icon: Kanban,          color: 'var(--blue)' },
  { to: '/snippets',  label: 'Snippets',  icon: Code2,           color: 'var(--yellow)' },
  { to: '/focus',     label: 'Focus',     icon: Timer,           color: 'var(--pink)' },
  { to: '/analytics', label: 'Analytics', icon: BarChart2,       color: 'var(--green)' },
]

const NavItem = memo(({ item, collapsed }) => {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
      style={({ isActive }) => isActive ? { '--item-color': item.color } : {}}
    >
      <span className={styles.navIcon}><Icon size={17} /></span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            className={styles.navLabel}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.18 }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && <span className={styles.navArrow} />}
    </NavLink>
  )
})

const Sidebar = memo(() => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 5 ? 'night owl 🦉' : hour < 12 ? 'good morning ☀️' : hour < 18 ? 'good afternoon 👋' : 'good evening 🌙'

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <motion.aside
      className={styles.sidebar}
      animate={{ width: collapsed ? 'var(--sidebar-collapsed-w)' : 'var(--sidebar-w)' }}
      transition={{ type: 'spring', stiffness: 320, damping: 38 }}
    >
      {/* Logo */}
      <div className={styles.logo}>
        <motion.div
          className={styles.logoMark}
          whileHover={{ rotate: 180, scale: 1.08 }}
          transition={{ duration: 0.35 }}
        >
          <Zap size={15} fill="currentColor" />
        </motion.div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              className={styles.logoText}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18 }}
            >
              DevPulse
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* User card */}
      <AnimatePresence initial={false}>
        {!collapsed && user && (
          <motion.div
            className={styles.userCard}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <img src={user.avatar_url} alt={user.login} className={styles.avatar} />
            <div className={styles.userText}>
              <span className={styles.userName}>{user.name || user.login}</span>
              <span className={styles.greeting}>{greeting}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.to} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">
          <LogOut size={14} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </motion.aside>
  )
})

export default Sidebar
