import React, { memo } from 'react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import styles from './Layout.module.css'

const Layout = memo(({ children }) => (
  <div className={styles.root}>
    <Sidebar />
    <main className={styles.main}>
      <div className={styles.content}>
        {children}
      </div>
    </main>
    <MobileNav />
  </div>
))

export default Layout
