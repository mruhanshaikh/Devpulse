import React, { useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Key, ArrowRight, AlertCircle, ExternalLink, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

const STEPS = [
  'Open GitHub → Settings → Developer settings',
  'Create a Personal Access Token (classic)',
  'Select: read:user + public_repo',
  'Paste the token below to continue',
]

const LoginPage = memo(() => {
  const { loginWithToken, loading, error } = useAuth()
  const [token, setToken] = useState('')
  const [showSteps, setShowSteps] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault()
    if (!token.trim()) return
    await loginWithToken(token.trim())
  }, [token, loginWithToken])

  return (
    <div className={styles.root}>
      <div className={styles.bg} aria-hidden />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <Zap size={16} />
          </div>
          <div>
            <h1 className={styles.title}>DevPulse</h1>
            <p className={styles.subtitle}>Connect your GitHub account</p>
          </div>
        </div>

        {/* Token help toggle */}
        <button
          className={styles.helpToggle}
          onClick={() => setShowSteps(s => !s)}
        >
          <Github size={14} />
          How to get token
          <ArrowRight size={14} className={showSteps ? styles.rotate : ''} />
        </button>

        <AnimatePresence>
          {showSteps && (
            <motion.div
              className={styles.steps}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {STEPS.map((t, i) => (
                <div key={i} className={styles.step}>
                  <span>{i + 1}</span>
                  <p>{t}</p>
                </div>
              ))}

              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                <ExternalLink size={12} />
                Open GitHub settings
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputBox}>
            <Key size={14} />
            <input
              type="password"
              placeholder="Paste your GitHub token"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div className={styles.error}>
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            className={styles.button}
            type="submit"
            disabled={!token.trim() || loading}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Connecting...' : 'Continue with GitHub'}
          </motion.button>
        </form>

        <p className={styles.footer}>
          Token is stored locally in your browser only.
        </p>
      </motion.div>
    </div>
  )
})

export default LoginPage