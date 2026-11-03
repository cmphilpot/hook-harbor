import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Same variables `npm run dev` gets from --env-file=.env, set before any
    // test code imports src/db/pool.ts
    env: parseEnv(readFileSync(".env", "utf8")) as Record<string, string>,
  },
});
