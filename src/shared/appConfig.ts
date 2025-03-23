import { z } from "zod";

require("dotenv").config();

const envSchema = z.object({
	PORT: z.string().default("5000"),
	NODE_ENV: z.string().default("development"),
	CADDY_ADMIN_URL: z.string().default("http://localhost:2019"),
	API_HOST: z.string(),
	CADDY_SERVER_IP: z.string(),
});

const appConfig = envSchema.parse(process.env);

export default appConfig;
