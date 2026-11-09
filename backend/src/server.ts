import { app } from "./app.js";
import { env } from "./config/env.js";

/**
 * Sweety API Server Entry Point
 */
const server = app.listen(env.PORT, () => {
  console.log(`🚀 Sweety API server running on http://localhost:${env.PORT}`);
  console.log(`   Health check available at http://localhost:${env.PORT}/api/health`);
  console.log(`   Environment: ${env.NODE_ENV}`);
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("🔒 HTTP server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export { server };

