import { SyncConfig } from "syncflow-engine";

export const syncConfig: SyncConfig = {
  retryLimit: 3,
  retryDelay: 2000,
  batchSize: 5,
  autoStart: true,
  debug: true,
};
