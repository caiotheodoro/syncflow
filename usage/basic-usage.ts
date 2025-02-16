import { MemorySyncStore, SyncEngine } from "../src";

const store = new MemorySyncStore();

const syncEngine = new SyncEngine(store, {
  retryLimit: 3,
  retryDelay: 2000,
  batchSize: 5,
  autoStart: true,
  debug: true,
});

syncEngine.addListener("syncStart", () => {
  console.log("Sync started");
});

syncEngine.addListener("syncComplete", () => {
  console.log("Sync completed");
});

await store.addOperation({
  type: "create",
  entity: "user",
  data: { name: "John Doe" },
  status: "pending",
  retryCount: 0,
});

await syncEngine.start();
