import React, { createContext, useEffect, useState, useMemo } from "react";
import {
  SyncEngine,
  MemorySyncStore,
  SyncStatus,
  SyncConfig,
  SyncOperation,
  SyncEventCallback,
} from "../index";

type SyncContextType = {
  status: SyncStatus;
  addOperation: (
    operation: Omit<SyncOperation, "id" | "timestamp" | "status" | "retryCount">
  ) => Promise<void>;
  engine: SyncEngine;
};

export const SyncContext = createContext<SyncContextType | null>(null);

type SyncProviderProps = {
  children: React.ReactNode;
  config?: Partial<SyncConfig>;
  store?: MemorySyncStore;
};

export const SyncProvider: React.FC<SyncProviderProps> = ({
  children,
  config,
  store = new MemorySyncStore(),
}) => {
  const [status, setStatus] = useState<SyncStatus>("idle");
  
  if (!config?.entityTypes?.length) {
    throw new Error("entityTypes must be provided in config");
  }

  const [engine] = useState(
    () =>
      new SyncEngine(
        store,
        {
          retryLimit: 3,
          retryDelay: 1000,
          batchSize: 10,
          autoStart: true,
          debug: false,
          ...config,
        },
        config.entityTypes
      )
  );

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    engine.addListener("statusChange", handleStatusChange as SyncEventCallback);
    engine.init();

    return () => {
      engine.removeListener("statusChange", handleStatusChange as SyncEventCallback);
    };
  }, [engine]);

  const addOperation = async (
    operation: Omit<SyncOperation, "id" | "timestamp" | "status" | "retryCount">
  ) => {
    await store.addOperation({
      ...operation,
      status: "pending",
      retryCount: 0,
    });
  };

  return (
    <SyncContext.Provider
      value={useMemo(() => ({
        status,
        addOperation,
        engine,
      }), [status, addOperation, engine])}
    >
      {children}
    </SyncContext.Provider>
  );
}; 