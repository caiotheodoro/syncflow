'use client'

import { Todo } from '@/types/todo'
import { Plus } from 'lucide-react'
import { useState } from 'react'

type AddTodoProps = {
  onAdd: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export const AddTodo = ({ onAdd }: AddTodoProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    onAdd({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: formData.get('priority') as Todo['priority'],
      category: formData.get('category') as Todo['category'],
      status: 'pending'
    })

    setIsOpen(false)
    e.currentTarget.reset()
  }

  return (
    <div className="w-full max-w-md">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-white transition-colors hover:bg-blue-600"
        >
          <Plus className="h-5 w-5" />
          Add New Todo
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div>
            <input
              type="text"
              name="title"
              placeholder="Todo title"
              required
              className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div>
            <textarea
              name="description"
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            />
          </div>
          <div className="flex gap-4">
            <select
              name="priority"
              required
              className="rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <select
              name="category"
              required
              className="rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            >
              Add Todo
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-gray-200 px-4 py-2 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
} 