Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: () => "1234-5678-9012-3456",
    getRandomValues: () => new Uint8Array(32),
  },
});

// Mock all logger methods
jest.mock("../utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
}));
