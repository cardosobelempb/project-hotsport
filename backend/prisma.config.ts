// prisma.config.ts
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env before defining the config
config();

export default defineConfig({
  // ... your other configurations
  datasource: {
    url: process.env.DATABASE_URL || "", // Use process.env
  },
});
