import { SyncOperation, Entity, EntityType } from "../types";

export interface ISyncStore {
  getOperations: () => Promise<SyncOperation[]>;
  addOperation: (
    operation: Omit<SyncOperation, "id" | "timestamp">
  ) => Promise<void>;
  updateOperation: (
    id: string,
    updates: Partial<SyncOperation>
  ) => Promise<void>;
  removeOperation: (id: string) => Promise<void>;
  getEntities: (entityType: EntityType) => Promise<Entity[]>;
  saveEntities: (entityType: EntityType, entities: Entity[]) => Promise<void>;
  cleanStorage: () => Promise<void>;
}

export class MemorySyncStore implements ISyncStore {
  private operations: SyncOperation[] = [];
  private entities: Map<string, Entity[]> = new Map();
  private readonly isServer: boolean;

  constructor() {
    this.isServer = typeof window === "undefined";
    if (!this.isServer) {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      if (this.isServer) return;

      const storedOps = window.localStorage.getItem("sync_operations");
      const storedEntities = window.localStorage.getItem("sync_entities");

      if (storedOps) {
        this.operations = JSON.parse(storedOps);
      }

      if (storedEntities) {
        const parsedEntities = JSON.parse(storedEntities);
        this.entities = new Map();
        Object.entries(parsedEntities).forEach(([key, value]) => {
          this.entities.set(key, value as Entity[]);
        });
      }
    } catch (error) {
      console.error("Error loading from storage:", error);
    }
  }

  private saveToStorage() {
    try {
      if (this.isServer) return;

      if (this.operations.length > 0) {
        window.localStorage.setItem(
          "sync_operations",
          JSON.stringify(this.operations)
        );
      } else {
        window.localStorage.removeItem("sync_operations");
      }

      if (this.entities.size > 0) {
        window.localStorage.setItem(
          "sync_entities",
          JSON.stringify(Object.fromEntries(this.entities))
        );
      } else {
        window.localStorage.removeItem("sync_entities");
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  }

  async getOperations(): Promise<SyncOperation[]> {
    return [...this.operations];
  }

  async addOperation(
    operation: Omit<SyncOperation, "id" | "timestamp">
  ): Promise<void> {
    const newOperation: SyncOperation = {
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    this.operations.push(newOperation);
    this.saveToStorage();
  }

  async updateOperation(
    id: string,
    updates: Partial<SyncOperation>
  ): Promise<void> {
    const index = this.operations.findIndex((op) => op.id === id);
    if (index !== -1) {
      this.operations[index] = { ...this.operations[index], ...updates };
      this.saveToStorage();
    }
  }

  async removeOperation(id: string): Promise<void> {
    this.operations = this.operations.filter((op) => op.id !== id);

    if (this.operations.length === 0) {
      if (!this.isServer) {
        window.localStorage.removeItem("sync_operations");
      }
    } else {
      this.saveToStorage();
    }
  }

  async getEntities(entityType: EntityType): Promise<Entity[]> {
    return this.entities.get(entityType) || [];
  }

  async saveEntities(
    entityType: EntityType,
    entities: Entity[]
  ): Promise<void> {
    if (entities.length === 0) {
      this.entities.delete(entityType);

      // If no entities left for this type, update storage
      if (!this.isServer && this.entities.size === 0) {
        window.localStorage.removeItem("sync_entities");
      }
    } else {
      this.entities.set(entityType, entities);
    }

    this.saveToStorage();
  }

  async cleanStorage(): Promise<void> {
    if (this.isServer) return;

    this.operations = [];
    this.entities = new Map();
    window.localStorage.removeItem("sync_operations");
    window.localStorage.removeItem("sync_entities");
  }
}
