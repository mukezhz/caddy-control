import { z } from "zod";

const envSchema = z.object({
  APP_HOST: z.string(),
  CADDY_SERVER_IP: z.string(),
  CADDY_ADMIN_URL: z.string(),
  JWT_SECRET: z.string()
});

export const validateEnv = () => envSchema.safeParse(process.env);

// extend ProcessEnv interface with environment variables schema
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
