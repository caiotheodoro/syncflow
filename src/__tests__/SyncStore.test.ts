import { MemorySyncStore } from "../core/SyncStore";
import { SyncOperation } from "../types";

describe("MemorySyncStore", () => {
  let store: MemorySyncStore;

  beforeEach(() => {
    store = new MemorySyncStore();
  });

  test("adds operation", async () => {
    const operation: SyncOperation = {
      id: "1",
      type: "create" as const,
      entity: "todo",
      data: { title: "Test" },
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    };

    await store.addOperation(operation);
    const ops = await store.getOperations();

    expect(ops).toHaveLength(1);
    expect(ops[0]).toMatchObject({
      ...operation,
      id: expect.any(String),
      timestamp: expect.any(Number),
    });
  });

  test("updates operation", async () => {
    const operation: SyncOperation = {
      id: "1",
      type: "create" as const,
      entity: "todo",
      data: { title: "Test" },
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    };

    await store.addOperation(operation);
    await store.updateOperation("1234-5678-9012-3456", { status: "completed" });

    const ops = await store.getOperations();
    expect(ops[0].status).toBe("completed");
  });

  test("deletes operation", async () => {
    const operation: SyncOperation = {
      id: "1",
      type: "create" as const,
      entity: "todo",
      data: { title: "Test" },
      status: "pending",
      timestamp: Date.now(),
      retryCount: 0,
    };

    await store.addOperation(operation);
    await store.removeOperation("1234-5678-9012-3456");

    const ops = await store.getOperations();
    expect(ops).toHaveLength(0);
  });
});
