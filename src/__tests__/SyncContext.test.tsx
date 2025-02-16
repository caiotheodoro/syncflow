import React from 'react'
import { render, act } from '@testing-library/react'
import { SyncProvider, SyncContext } from '../react/SyncContext'
import { MemorySyncStore } from '../core/SyncStore'

describe('SyncContext', () => {
  const TestComponent = ({ onContext }: { onContext: (ctx: any) => void }) => {
    const context = React.useContext(SyncContext);
    onContext(context);
    return null;
  };

  test('provides sync context to children', () => {
    let contextValue: any = null
    
    render(
      <SyncProvider config={{ entityTypes: ["todo"] }}>
        <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
      </SyncProvider>
    )

    expect(contextValue).toHaveProperty('status')
    expect(contextValue).toHaveProperty('addOperation')
    expect(contextValue).toHaveProperty('engine')
  })

  test('initializes with custom store', async () => {
    const store = new MemorySyncStore()
    let contextValue: any = null
    
    await act(() => {
      render(
        <SyncProvider store={store} config={{ entityTypes: ["todo"] }}>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SyncProvider>
      )
    })

    expect(contextValue.engine).toBeDefined()
  })

  test('adds operation through context', async () => {
    const store = new MemorySyncStore()
    let contextValue: any = null
    
    await act(() => {
      render(
        <SyncProvider store={store} config={{ entityTypes: ["todo"] }}>
          <TestComponent onContext={(ctx) => { contextValue = ctx; }} />
        </SyncProvider>
      )
    })

    await act(() => {
      contextValue.addOperation({
        type: 'create' as const,
        entity: 'todo',
        data: { title: 'Test' }
      })
    })

    const ops = await store.getOperations()
    expect(ops).toHaveLength(1)
    expect(ops[0].status).toBe('pending')
  })
}) 