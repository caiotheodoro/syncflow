import { useContext, useEffect, useCallback } from "react";
import { SyncEventType, SyncEventCallback } from "../types";
import { SyncContext } from "./SyncContext";

export const useSync = () => {
  const context = useContext(SyncContext);

  if (!context) {
    throw new Error("useSync must be used within a SyncProvider");
  }

  return context;
};

export const useSyncListener = (
  event: SyncEventType,
  callback: SyncEventCallback
) => {
  const { engine } = useSync();

  useEffect(() => {
    engine.addListener(event, callback);
    return () => {
      engine.removeListener(event, callback);
    };
  }, [engine, event, callback]);
};

export const useSyncOperation = () => {
  const { addOperation, status } = useSync();

  const isLoading = status === "syncing";

  const sync = useCallback(
    async (
      type: "create" | "update" | "delete",
      entity: string,
      data: unknown
    ) => {
      await addOperation({
        type,
        entity,
        data,
      });
    },
    [addOperation]
  );

  return {
    sync,
    isLoading,
    status,
  };
};
