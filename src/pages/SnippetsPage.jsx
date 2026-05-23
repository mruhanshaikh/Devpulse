import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Code2 } from 'lucide-react'
import SnippetsVault from '../components/snippets/SnippetsVault'
import { useSnippets } from '../context/UserStoreContext'
import styles from './Page.module.css'

const SnippetsPage = memo(() => {
  const snippets = useSnippets(s => s.snippets)
  const pinned   = snippets.filter(s => s.pinned).length
  return (
    <motion.div className={styles.page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}><Code2 size={20} className={styles.pageIcon} />Snippet Vault</h1>
          <p className={styles.pageSub}>{snippets.length} saved · {pinned} pinned · click to expand</p>
        </div>
      </div>
      <SnippetsVault />
    </motion.div>
  )
})
export default SnippetsPage
