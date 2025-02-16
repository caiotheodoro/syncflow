'use client'

import { Todo } from '@/types/todo'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock, Edit3, Trash2 } from 'lucide-react'
import { useState } from 'react'

type TodoItemProps = {
  todo: Todo
  onStatusChange: (id: string, status: Todo['status']) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onEdit: (todo: Todo) => Promise<void>
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}

const categoryIcons = {
  work: '💼',
  personal: '👤',
  shopping: '🛒',
  health: '🏥',
  other: '📌'
}

export const TodoItem = ({ todo, onStatusChange, onDelete, onEdit }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(todo.title)

  const handleCheck = async () => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
    await onStatusChange(todo.id, newStatus)
  }

  const handleDelete = async () => {
    await onDelete(todo.id)
  }

  const handleSubmitEdit = async () => {
    if (editedTitle.trim() !== todo.title) {
      await onEdit({ ...todo, title: editedTitle.trim() })
    }
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-gray-800"
    >
      <button
        onClick={handleCheck}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {todo.status === 'completed' && (
          <svg className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        {isEditing ? (
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              autoFocus
            />
            <button
              onClick={handleSubmitEdit}
              className="rounded-lg bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Save
            </button>
          </div>
        ) : (
          <h3 className={`text-lg font-medium ${todo.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
            {todo.title}
          </h3>
        )}
        {todo.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{todo.description}</p>
        )}
        <div className="mt-2 flex gap-2">
          <span className={`rounded-full px-2 py-1 text-xs ${priorityColors[todo.priority]}`}>
            {todo.priority}
          </span>
          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-700">
            {categoryIcons[todo.category]} {todo.category}
          </span>
        </div>
      </div>

      <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Edit todo"
        >
          <Edit3 className="h-4 w-4" />
        </button>
        <button
          onClick={handleDelete}
          className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Delete todo"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </motion.div>
  )
} 