import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Kanban } from 'lucide-react'
import KanbanBoard from '../components/kanban/KanbanBoard'
import { useKanban } from '../context/UserStoreContext'
import styles from './Page.module.css'

export const KanbanPage = memo(() => {
  const columns = useKanban(s => s.columns)
  const total   = Object.values(columns).reduce((a, c) => a + c.tasks.length, 0)
  const done    = columns.done?.tasks.length || 0

  return (
    <motion.div className={styles.page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><Kanban size={20} className={styles.pageIcon} />Kanban Board</h1>
          <p className={styles.pageSub}>{total} tasks · {done} completed · drag to move between columns</p>
        </div>
      </div>
      <KanbanBoard />
    </motion.div>
  )
})
