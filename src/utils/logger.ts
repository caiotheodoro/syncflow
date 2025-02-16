export const logger = {
  debug: (message: string, ...args: any[]) => {
    console.debug(`[SyncFlow] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[SyncFlow] ${message}`, ...args);
  },
};
