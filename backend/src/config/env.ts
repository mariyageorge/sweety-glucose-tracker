import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string({
    required_error: "DATABASE_URL is required in .env",
  }),
  JWT_SECRET: z
    .string({
      required_error: "JWT_SECRET is required in .env",
    })
    .min(16, "JWT_SECRET should be at least 16 characters for security"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  APP_TIMEZONE: z.string().default("Asia/Kolkata"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

