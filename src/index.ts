import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import api from "./api";
import prismaClient from "./db";
import { initializeCaddyConfiguration } from "./init-app";
import * as middlewares from "./middlewares";

require("dotenv").config();

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (_, res) => {
	res.json({
		message: "Hello, World!",
	});
});

app.use("/api/v1", api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, async () => {
	// initialize configuration
	initializeCaddyConfiguration();

	/* eslint-disable no-console */
	console.log(`Listening: http://localhost:${port}`);
	/* eslint-enable no-console */
});

process.on("SIGTERM", async () => {
	console.info("SIGTERM signal received");
	console.info("Closing server. Goodbye!");
	await prismaClient.$disconnect();
	process.exit(0);
});
