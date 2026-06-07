import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests run in plain node (the engine is pure) and resolve the "@/" alias the
// same way Next does, so they can import real domain data.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
});
