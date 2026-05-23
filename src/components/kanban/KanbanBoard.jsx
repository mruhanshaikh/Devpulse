import React, {
  memo,
  useState,
  useCallback,
  useMemo,
} from 'react'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'

import { CSS } from '@dnd-kit/utilities'

import { motion, AnimatePresence } from 'framer-motion'

import {
  Plus,
  Trash2,
  GripVertical,
  Clock,
} from 'lucide-react'

import { toast } from 'sonner'

import { useKanban as useKanbanStore } from '../../context/UserStoreContext'

import {
  Tag,
  Button,
  EmptyState,
} from '../ui'

import styles from './Kanban.module.css'

const PRIORITY_MAP = {
  high: {
    label: 'high',
    color: 'var(--red)',
    bg: 'var(--red-dim)',
  },

  medium: {
    label: 'med',
    color: 'var(--yellow)',
    bg: 'var(--yellow-dim)',
  },

  low: {
    label: 'low',
    color: 'var(--green)',
    bg: 'var(--green-dim)',
  },
}

const timeAgo = (ts) => {
  const diff = Date.now() - ts

  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}m ago`
  }

  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}h ago`
  }

  return `${Math.floor(diff / 86400000)}d ago`
}

/* Empty Drop Zone */

const EmptyDrop = ({ id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`${styles.emptyDropZone} ${
        isOver ? styles.emptyDropActive : ''
      }`}
    >
      <EmptyState
        icon="📭"
        title="No tasks"
        description="Drag tasks here or click +"
      />
    </div>
  )
}

/* Task Card */
const TaskCard = memo(({ task, columnId }) => {
  const deleteTask = useKanbanStore((s) => s.deleteTask)

  const [hovering, setHovering] = useState(false)

  const priority =
    PRIORITY_MAP[task.priority] || PRIORITY_MAP.medium

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const handleDelete = () => {
    toast('Delete task?', {
      description: task.title,
      action: {
        label: 'Delete',
        onClick: () => {
          deleteTask(task.id, columnId)
          toast.success('Task deleted')
        },
      },
    })
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={styles.taskCard}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className={styles.taskHeader}>
        <div
          className={styles.taskDrag}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={13} />
        </div>

        <span className={styles.taskTitle}>
          {task.title}
        </span>

        <AnimatePresence>
          {hovering && (
            <motion.button
              className={styles.deleteBtn}
              onClick={handleDelete}
              initial={{
                opacity: 0,
                scale: 0.7,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.7,
              }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 size={12} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.taskMeta}>
        <Tag label={task.tag} />

        <span
          className={styles.priorityBadge}
          style={{
            color: priority.color,
            background: priority.bg,
          }}
        >
          {priority.label}
        </span>

        <span className={styles.taskTime}>
          <Clock size={10} />
          {timeAgo(task.createdAt)}
        </span>
      </div>
    </motion.div>
  )
})


/* Add Form */


const AddTaskForm = memo(({ columnId, onClose }) => {
  const addTask = useKanbanStore((s) => s.addTask)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [tag, setTag] = useState('general')

  const handleSubmit = useCallback(() => {
    if (!title.trim()) return

    addTask(columnId, {
      title: title.trim(),
      priority,
      tag,
    })

    toast.success('Task added')

    onClose()
  }, [title, priority, tag, columnId, addTask, onClose])

  return (
    <motion.div
      className={styles.addForm}
      initial={{
        opacity: 0,
        y: -8,
        height: 0,
      }}
      animate={{
        opacity: 1,
        y: 0,
        height: 'auto',
      }}
      exit={{
        opacity: 0,
        y: -8,
        height: 0,
      }}
    >
      <textarea
        className={styles.addInput}
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        rows={2}
        autoFocus
      />

      <div className={styles.addFormRow}>
        <select
          className={styles.select}
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className={styles.select}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          {[
            'general',
            'frontend',
            'backend',
            'design',
            'testing',
            'devops',
            'ui',
          ].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSubmit}
        >
          Add
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  )
})

/* Column */


const KanbanColumn = memo(({ column }) => {
  const [adding, setAdding] = useState(false)

  const taskIds = useMemo(
    () => column.tasks.map((t) => t.id),
    [column.tasks]
  )

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <div className={styles.columnTitle}>
          <span
            className={styles.columnDot}
            style={{
              background: column.color,
            }}
          />

          <span className={styles.columnName}>
            {column.title}
          </span>

          <span className={styles.columnCount}>
            {column.tasks.length}
          </span>
        </div>

        <button
          className={styles.addBtn}
          onClick={() => setAdding(true)}
        >
          <Plus size={14} />
        </button>
      </div>

      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <div className={styles.taskList}>
          <AnimatePresence>
            {adding && (
              <AddTaskForm
                columnId={column.id}
                onClose={() => setAdding(false)}
              />
            )}
          </AnimatePresence>

          {column.tasks.length === 0 &&
            !adding && (
              <EmptyDrop id={column.id} />
            )}

          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
})

/* Board */

const KanbanBoard = memo(() => {
  const { columns, moveTask } =
    useKanbanStore()

  const [activeTask, setActiveTask] =
    useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = useCallback(
    ({ active }) => {
      const colId =
        active.data.current?.columnId

      const task =
        columns[colId]?.tasks.find(
          (t) => t.id === active.id
        )

      setActiveTask(task || null)
    },
    [columns]
  )

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveTask(null)

      if (!over) return

      const activeId = active.id

      const fromCol =
        active.data.current?.columnId

      let toCol =
        over.data.current?.columnId

      if (!toCol && columns[over.id]) {
        toCol = over.id
      }

      if (!fromCol || !toCol) return

      if (fromCol === toCol) return

      moveTask(activeId, fromCol, toCol)

      toast.success('Task moved')
    },
    [columns, moveTask]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.board}>
        {Object.values(columns).map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div
            className={`${styles.taskCard} ${styles.dragging}`}
          >
            <div className={styles.taskTitle}>
              {activeTask.title}
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
})

export default KanbanBoard