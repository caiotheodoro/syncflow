import { SyncEngine } from "../core/SyncEngine";
import { ISyncStore, MemorySyncStore } from "../core/SyncStore";
import { SyncOperation } from "../types";

describe("SyncEngine", () => {
  let engine: SyncEngine;
  let store: MemorySyncStore;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    store = new MemorySyncStore();
    engine = new SyncEngine(store, {
      retryLimit: 3,
      retryDelay: 1000,
      batchSize: 10,
      autoStart: false,
      debug: false,
      entityTypes: ["todo"],
    });
  });

  afterEach(async () => {
    await engine.stop();
    process.env.NODE_ENV = "development";
  });

  test("initializes with idle status", () => {
    expect(engine.getStatus()).toBe("idle");
  });

  test("starts sync process", async () => {
    await engine.start();
    expect(engine.getStatus()).toBe("idle");
  });

  test("processes pending operations", async () => {
    const operation: SyncOperation = {
      id: "1",
      type: "create",
      entity: "todo",
      data: { id: "1", title: "Test" },
      status: "pending",
      retryCount: 0,
      timestamp: Date.now(),
    };

    await store.addOperation(operation);
    await engine.sync();

    const ops = await store.getOperations();
    expect(ops[0]?.status).toBe("completed");
  });

  test("handles operation errors", async () => {
    const operation: SyncOperation = {
      id: "1",
      type: "create" as const,
      entity: "todo",
      data: { title: "Test" },
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    };

    const mockStore = {
      getOperations: jest.fn().mockResolvedValue([operation]),
      addOperation: jest.fn(),
      removeOperation: jest.fn(),
      updateOperation: jest.fn().mockRejectedValue(new Error("Test error")),
      getEntities: jest.fn().mockResolvedValue([]),
      saveEntities: jest.fn(),
    };

    const errorEngine = new SyncEngine(mockStore as unknown as ISyncStore, {
      retryLimit: 3,
      retryDelay: 1000,
      batchSize: 10,
      autoStart: false,
      debug: false,
    });

    await errorEngine.sync();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errorEngine.getStatus()).toBe("error");
  }, 10000);
});
