import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import Analytics from '../components/analytics/Analytics'
import styles from './Page.module.css'

const AnalyticsPage = memo(() => (
  <motion.div className={styles.page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}><BarChart2 size={20} className={styles.pageIcon} />Analytics</h1>
        <p className={styles.pageSub}>Real GitHub data · live commit stats · focus trends</p>
      </div>
    </div>
    <Analytics />
  </motion.div>
))
export default AnalyticsPage
