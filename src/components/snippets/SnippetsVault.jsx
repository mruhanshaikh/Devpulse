import React, { memo, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { Pin, Copy, Trash2, Plus, Check, Search, X, Code2, Save } from 'lucide-react'
import { useSnippets as useSnippetsStore } from '../../context/UserStoreContext'
import { useDebounce, useClipboard } from '../../hooks'
import { Tag, Button, EmptyState } from '../ui'
import styles from './Snippets.module.css'

SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('css', css)

// Snippet Card 
const SnippetCard = memo(({ snippet, onExpand, expanded }) => {
  const { deleteSnippet, togglePin } = useSnippetsStore()
  const { copied, copy } = useClipboard()

  return (
    <motion.div
      className={`${styles.card} ${expanded ? styles.cardExpanded : ''} ${snippet.pinned ? styles.pinned : ''}`}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <Code2 size={13} className={styles.langIcon} />
          <span className={styles.cardTitle}>{snippet.title}</span>
          {snippet.pinned && <Pin size={11} className={styles.pinnedIcon} />}
        </div>
        <div className={styles.cardTags}>
          <Tag label={snippet.language} />
          <Tag label={snippet.tag} />
        </div>
      </div>

      {/* Code block */}
      <div className={styles.codeWrap} onClick={() => onExpand(snippet.id)}>
        <SyntaxHighlighter
          language={snippet.language}
          style={atomOneDark}
          customStyle={{
            background: 'var(--bg-base)',
            fontSize: '0.72rem',
            borderRadius: 0,
            padding: '12px 14px',
            margin: 0,
            maxHeight: expanded ? '360px' : '78px',
            overflow: expanded ? 'auto' : 'hidden',
            transition: 'max-height 0.3s ease',
            cursor: 'pointer',
          }}
          showLineNumbers={expanded}
        >
          {snippet.code}
        </SyntaxHighlighter>
        {!expanded && <div className={styles.fadeOut} />}
      </div>

      {/* Footer */}
      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>
          {new Date(snippet.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
        </span>
        <div className={styles.cardActions}>
          <motion.button
            className={`${styles.actionBtn} ${snippet.pinned ? styles.activePinBtn : ''}`}
            onClick={() => togglePin(snippet.id)}
            whileTap={{ scale: 0.85 }}
            title={snippet.pinned ? 'Unpin' : 'Pin'}
          >
            <Pin size={13} />
          </motion.button>
          <motion.button
            className={`${styles.actionBtn} ${copied ? styles.copiedBtn : ''}`}
            onClick={() => copy(snippet.code)}
            whileTap={{ scale: 0.85 }}
            title="Copy code"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </motion.button>
          <motion.button
            className={`${styles.actionBtn} ${styles.deleteBtn}`}
            onClick={() => deleteSnippet(snippet.id)}
            whileTap={{ scale: 0.85 }}
            title="Delete"
          >
            <Trash2 size={13} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
})

//  Add Snippet Modal 
const AddSnippetModal = memo(({ onClose }) => {
  const addSnippet = useSnippetsStore(s => s.addSnippet)
  const [form, setForm] = useState({ title: '', language: 'javascript', tag: 'general', code: '' })

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  const handleAdd = useCallback(() => {
    if (!form.title.trim() || !form.code.trim()) return
    addSnippet(form)
    onClose()
  }, [form, addSnippet, onClose])

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>New snippet</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Title */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Title</label>
            <input
              className={styles.input}
              placeholder="e.g. Debounce hook…"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Language + Tag row */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Language</label>
              <select className={styles.select} value={form.language} onChange={e => set('language', e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="css">CSS</option>
                <option value="python">Python</option>
                <option value="bash">Bash</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Tag</label>
              <select className={styles.select} value={form.tag} onChange={e => set('tag', e.target.value)}>
                {['general', 'hooks', 'utils', 'async', 'layout', 'frontend', 'backend'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Code */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Code</label>
            <textarea
              className={styles.codeInput}
              placeholder="Paste your code here…"
              value={form.code}
              onChange={e => set('code', e.target.value)}
              rows={10}
              spellCheck={false}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleAdd} icon={<Save size={13} />}>
            Save snippet
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
})

// Snippets Vault
const SnippetsVault = memo(() => {
  const snippets = useSnippetsStore(s => s.snippets)
  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState('all')
  const [expandedId, setExpandedId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  const filtered = useMemo(() => {
    let list = [...snippets].sort((a, b) => b.pinned - a.pinned || b.createdAt - a.createdAt)
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q)
      )
    }
    if (filterLang !== 'all') list = list.filter(s => s.language === filterLang)
    return list
  }, [snippets, debouncedSearch, filterLang])

  const langs = useMemo(() => ['all', ...new Set(snippets.map(s => s.language))], [snippets])

  const handleExpand = useCallback((id) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={13} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search snippets…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className={styles.clearBtn} onClick={() => setSearch('')} aria-label="Clear">
              <X size={12} />
            </button>
          )}
        </div>

        <div className={styles.filters}>
          {langs.map(l => (
            <button
              key={l}
              className={`${styles.filterBtn} ${filterLang === l ? styles.filterActive : ''}`}
              onClick={() => setFilterLang(l)}
            >
              {l}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={13} />}
          onClick={() => setShowModal(true)}
        >
          New
        </Button>
      </div>

      {/* Grid or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No snippets found"
          description="Add your first code snippet to get started"
        />
      ) : (
        <motion.div className={styles.grid} layout>
          <AnimatePresence mode="popLayout">
            {filtered.map(snippet => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                expanded={expandedId === snippet.id}
                onExpand={handleExpand}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {showModal && <AddSnippetModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
})

export default SnippetsVault