# SyncFlow

A lightweight offline-first synchronization library for React/Next.js applications, with built-in persistence and queue management.

## Features

- 🔄 Offline-first synchronization
- 💾 Automatic localStorage persistence
- ⚛️ React hooks and context provider
- 🔍 Operation queue monitoring
- 📦 TypeScript support
- ⚡ Automatic retries
- 🎯 Entity-based sync management

## Installation

```bash
npm install syncflow-engine
# or
yarn add syncflow-engine
# or
pnpm add syncflow-engine
```

## Quick Start

### 1. Set up your sync configuration

```typescript
// lib/sync-config.ts
import { SyncConfig } from "syncflow-engine";

export const syncConfig: SyncConfig = {
  retryLimit: 3,
  retryDelay: 2000,
  batchSize: 5,
  autoStart: true,
  debug: true,
  entityTypes: ["todo"], // Specify your entity types
};
```

### 2. Wrap your application with SyncProvider

```typescript
// app/layout.tsx or pages/_app.tsx
import { SyncProvider } from 'syncflow-engine';
import { syncConfig } from '@/lib/sync-config';

export default function RootLayout({ children }) {
  return (
    <SyncProvider config={syncConfig}>
      {children}
    </SyncProvider>
  );
}
```

### 3. Use the sync hooks in your components

```typescript
import { useSync } from 'syncflow-engine';
import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

function TodoList() {
  const { engine, addOperation, status } = useSync();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Load and sync todos
  useEffect(() => {
    const loadTodos = async () => {
      const storedTodos = await engine.getEntities("todo");
      setTodos(storedTodos as Todo[]);
    };
    
    const handleEntityUpdate = (updatedTodos: unknown) => {
      setTodos(updatedTodos as Todo[]);
    };

    loadTodos();
    engine.addEntityListener("todo", handleEntityUpdate);
    
    return () => {
      engine.removeEntityListener("todo", handleEntityUpdate);
    };
  }, [engine]);

  // Add a new todo
  const handleAddTodo = async (title: string) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTodos(current => [...current, todo]);
    
    await addOperation({
      type: 'create',
      entity: 'todo',
      data: todo
    });
  };

  // Toggle online/offline mode
  const handleToggleOffline = () => {
    if (isOffline) {
      engine.start();
    } else {
      engine.stop();
    }
    setIsOffline(!isOffline);
  };

  return (
    <div>
      <div>Sync Status: {status}</div>
      <button onClick={handleToggleOffline}>
        {isOffline ? 'Go Online' : 'Go Offline'}
      </button>
      {/* Rest of your UI */}
    </div>
  );
}
```

## API Reference

### SyncProvider Props

```typescript
interface SyncConfig {
  retryLimit: number;      // Maximum retry attempts
  retryDelay: number;      // Delay between retries (ms)
  batchSize: number;       // Operations to process per sync
  autoStart: boolean;      // Start sync automatically
  debug: boolean;          // Enable debug logging
  entityTypes: string[];   // Entity types to sync
}
```

### useSync Hook

```typescript
const { 
  engine,           // SyncEngine instance
  addOperation,     // Function to add sync operations
  status           // Current sync status
} = useSync();
```

### SyncEngine Methods

```typescript
interface ISyncEngine {
  // Start sync process
  start(): Promise<void>;
  
  // Stop sync process
  stop(): Promise<void>;
  
  // Manually trigger sync
  sync(): Promise<void>;
  
  // Get current sync status
  getStatus(): "idle" | "syncing" | "error" | "offline";
  
  // Get entities by type
  getEntities(entityType: string): Promise<Entity[]>;
  
  // Add entity update listener
  addEntityListener(
    entityType: string,
    callback: (entities: Entity[]) => void
  ): void;
  
  // Remove entity listener
  removeEntityListener(
    entityType: string,
    callback: (entities: Entity[]) => void
  ): void;
  
  // Get pending operations
  getPendingOperations(): Promise<SyncOperation[]>;
  
  // Remove all pending operations
  removePendingOperations(): Promise<SyncOperation[]>;
}
```

### Operation Types

```typescript
interface SyncOperation {
  id: string;
  timestamp: number;
  type: "create" | "update" | "delete";
  entity: string;
  data: unknown;
  status: "pending" | "completed" | "error";
  retryCount: number;
}
```

## Storage

The library uses localStorage by default to persist:
- Pending operations
- Entity data
- Sync state

Data is automatically loaded when the application starts and saved when:
- Operations are added/updated/removed
- Entities are updated
- Sync status changes

## Offline Support

1. Toggle offline mode:
```typescript
// Go offline
engine.stop();

// Go online
engine.start();
```

2. Operations performed while offline are:
- Stored in localStorage
- Queued for sync
- Processed when back online

## Example Implementation

Check out the complete todo app example in the `/usage/next-15` directory for a full implementation including:
- Todo CRUD operations
- Offline mode toggle
- Operation queue monitoring
- Sync status display
- Entity persistence

## License

MIT License - see the [LICENSE](LICENSE) file for details.
