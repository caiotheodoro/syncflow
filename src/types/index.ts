export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type SyncOperation = {
  id: string;
  timestamp: number | Date;
  type: "create" | "update" | "delete";
  entity: string;
  data: unknown;
  status: "pending" | "completed" | "error";
  retryCount: number;
};

export interface SyncConfig {
  retryLimit: number;
  retryDelay: number;
  batchSize: number;
  autoStart: boolean;
  debug: boolean;
  entityTypes?: EntityType[];
}

export type Entity = {
  id: string;
  [key: string]: any;
};

export type SyncEvent =
  | "syncStart"
  | "syncComplete"
  | "syncError"
  | "statusChange"
  | "operationComplete";
export type EntityType = string;
export type SyncEventType = SyncEvent | EntityType;

export type SyncEventCallback = (data?: unknown) => void;

export interface ISyncEngine {
  init(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  sync(): Promise<void>;
  getStatus(): SyncStatus;
  addListener(event: SyncEventType, callback: SyncEventCallback): void;
  removeListener(event: SyncEventType, callback: SyncEventCallback): void;
  getEntities(entityType: EntityType): Promise<Entity[]>;
  getEntityTypes(): EntityType[];
  addEntityListener(
    entityType: EntityType,
    callback: (entities: Entity[]) => void
  ): void;
  removeEntityListener(
    entityType: EntityType,
    callback: (entities: Entity[]) => void
  ): void;
  getPendingOperations(): Promise<SyncOperation[]>;
  removePendingOperations(): Promise<SyncOperation[]>;
}
