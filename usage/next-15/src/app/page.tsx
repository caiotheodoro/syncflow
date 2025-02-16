'use client'

import { TodoItem } from '@/components/TodoItem'
import { syncConfig } from '@/lib/sync-config'
import { Todo } from '@/types/todo'
import { SyncProvider, useSync } from 'syncflow-engine'
import { v4 as uuidv4 } from 'uuid'
import { useState, useEffect } from 'react'

const TodoList = () => {
  const { engine, addOperation,status } = useSync()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [isOffline, setIsOffline] = useState(false)
  const [pendingOps, setPendingOps] = useState<any[]>([])
  const [showPending, setShowPending] = useState(true)

  useEffect(() => {
    const loadTodos = async () => {
      const storedTodos = await engine.getEntities("todo")
      setTodos(storedTodos as Todo[])
    }
    
    loadTodos()
    
    const handleEntityUpdate = (updatedTodos: unknown) => {
      setTodos(updatedTodos as Todo[])
    }

    const handleStatusChange = (status: unknown) => {
      setIsOffline(status === 'offline');
    }

    engine.addEntityListener("todo", handleEntityUpdate)
    engine.addListener("statusChange", handleStatusChange)
    
    return () => {
      engine.removeEntityListener("todo", handleEntityUpdate)
      engine.removeListener("statusChange", handleStatusChange)
    }
  }, [engine])

  useEffect(() => {
    const updatePendingOps = async () => {
      if (showPending) {
        const operations = await engine.getPendingOperations()
        setPendingOps(operations)
      }
    }
    updatePendingOps()
  }, [engine, showPending, isOffline])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const todo: Todo = {
      id: uuidv4(),
      title: newTodo.trim(),
      status: 'pending',
      priority: 'medium',
      category: 'health',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTodos(currentTodos => [...currentTodos, todo])
    setNewTodo('')
    
    await addOperation({
      type: 'create',
      entity: 'todo',
      data: todo
    })
  }

  const handleToggleOffline = () => {
    if (isOffline) {
      engine.start()
    } else {
      engine.stop()
    }
    setIsOffline(!isOffline)
  }

  const handleShowPending = async () => {
    const operations = await engine.getPendingOperations()
    setPendingOps(operations)
    setShowPending(!showPending)
  }

  const handleStatusChange = async (id: string, status: Todo['status']) => {
    const todoToUpdate = todos.find(t => t.id === id)
    if (!todoToUpdate) return

    const updatedTodo = { ...todoToUpdate, status, updatedAt: new Date() }
    setTodos(currentTodos => 
      currentTodos.map(t => t.id === id ? updatedTodo : t)
    )
    
    await addOperation({
      type: 'update',
      entity: 'todo',
      data: updatedTodo
    })
  }

  const handleDelete = async (id: string) => {
    setTodos(currentTodos => currentTodos.filter(t => t.id !== id))
    
    await addOperation({
      type: 'delete',
      entity: 'todo',
      data: { id }
    })
  }

  const handleEdit = async (todo: Todo) => {
    setTodos(currentTodos => 
      currentTodos.map(t => t.id === todo.id ? todo : t)
    )
    
    await addOperation({
      type: 'update',
      entity: 'todo',
      data: todo
    })
  }

  const handleSync = async () => {
    await engine.sync();
    const operations = await engine.getPendingOperations();
    setPendingOps(operations);
  }

  const handleCleanup = async () => {
    const operations = await engine.removePendingOperations();
    setPendingOps([]);
    return operations;
  }

  useEffect(() => {
    if (status !== 'offline') {
      const syncTimer = setInterval(async () => {
        await handleSync();
      }, 4000);

      return () => clearInterval(syncTimer);
    }
  }, [engine, status]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-8">
      <header className="text-center">
        <p className="mt-2 text-gray-600 dark:text-gray-400">Status: {status}</p>
      </header>

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleToggleOffline}
          className={`px-4 py-2 rounded-lg font-semibold text-white ${
            isOffline 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isOffline ? 'Go Online' : 'Go Offline'}
        </button>
        <button
          onClick={handleShowPending}
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold text-white"
        >
          {showPending ? 'Hide' : 'Show'} Pending Operations
        </button>
        <button
          onClick={handleCleanup}
          className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 font-semibold text-white"
        >
          Clean Pending Operations
        </button>
      </div>

      {showPending && pendingOps.length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Pending Operations</h2>
          <div className="space-y-2">
            {pendingOps.map((op) => (
              <div 
                key={op.id}
                className="bg-white dark:bg-gray-700 p-2 rounded"
              >
                <span className="font-medium">{op.type}</span>
                {' - '}
                <span className="text-gray-600 dark:text-gray-400">
                  {op.entity}: {JSON.stringify(op.data)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Add Todo
        </button>
      </form>

      <div className="space-y-4">
        {Array.isArray(todos) && todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <SyncProvider config={{ ...syncConfig, entityTypes: ["todo"] }}>
      <TodoList />
    </SyncProvider>
  )
}
