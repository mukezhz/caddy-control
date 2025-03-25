import { z } from "zod";

const envSchema = z.object({
  API_HOST: z.string(),
  CADDY_SERVER_IP: z.string(),
  CADDY_ADMIN_URL: z.string(),
});

export const validateEnv = () => envSchema.safeParse(process.env);

// extend ProcessEnv interface with environment variables schema
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace NodeJS {
    /* eslint-disable @typescript-eslint/no-empty-object-type */
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
