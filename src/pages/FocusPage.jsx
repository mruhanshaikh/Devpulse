import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Timer } from 'lucide-react'
import Pomodoro from '../components/pomodoro/Pomodoro'
import styles from './Page.module.css'

const FocusPage = memo(() => (
  <motion.div className={styles.page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}><Timer size={20} className={styles.pageIcon} />Focus Timer</h1>
        <p className={styles.pageSub}>Pomodoro sessions · your data saved per account</p>
      </div>
    </div>
    <Pomodoro />
  </motion.div>
))
export default FocusPage
