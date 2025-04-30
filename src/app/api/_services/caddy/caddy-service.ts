import axios, { AxiosResponse } from "axios";
import type { MainConfig } from "./template-types";
import { getCaddyConfigTemplate, getRouteTemplate } from "./caddy-templates";
import prisma from "../../../../lib/prisma";

const caddyAdminURL = process.env.CADDY_ADMIN_URL;
const appHost = process.env.APP_HOST;
const appPort = process.env.PORT;
const appService = process.env.SERVICE_NAME || "caddycontrol"


export const getCaddyConfig = async (timeout = 0): Promise<MainConfig> => {
	const caddyConfig = await axios.get(`${caddyAdminURL}/config`, {
		timeout,
	});
	return caddyConfig.data;
};

export const loadCaddyConfig = async (
	payload: MainConfig,
): Promise<MainConfig> => {
	const caddyConfig: AxiosResponse<MainConfig> = await axios.post(
		`${caddyAdminURL}/load`,
		payload,
	);
	return caddyConfig.data;
};

export const validateIncomingDomain = async (incomingAddress: string) => {
	const currentConfig = await getCaddyConfig();
	const hasExistingRoute = currentConfig.apps.http.servers.main.routes.find(
		(route) => {
			return route.match.some((ma) => ma.host.includes(incomingAddress));
		},
	);
	return {
		currentConfig,
		hasExistingRoute,
	};
};

const constructInitialCaddyConfiguration = () => {
	const backendRoute = getRouteTemplate(
		appHost,
		appService,
		Number(appPort),
		false
	);
	const caddyConfig = getCaddyConfigTemplate([backendRoute]);
	return caddyConfig;
};

export const initializeCaddyConfiguration = async () => {
	const existingConfig = await prisma.caddyConfiguration.findFirst({
		orderBy: {
			createdAt: "desc",
		},
	});
	//   if exsits, update the caddy configuration
	if (existingConfig) {
		console.log(
			"Configuration exists. Updating caddy server with the new configuration.",
		);
		await loadCaddyConfig(existingConfig.config as MainConfig);
		console.log("Caddy server updated.");
		return;
	}

	//   if doesnt exists, initialize the caddy configuration
	console.log(
		"Configuration does not exist. Generating initial configuration.",
	);
	const initialCaddyConfig = constructInitialCaddyConfiguration();
	console.log("Updating caddy server with the new configuration.");
	await loadCaddyConfig(initialCaddyConfig);
	console.log("Caddy server updated.");
	console.log("Saving configuration to database.");
	await prisma.caddyConfiguration.create({
		data: {
			config: JSON.parse(JSON.stringify(initialCaddyConfig)),
		},
	});
	await prisma.domains.create({
		data: {
			incomingAddress: appHost,
			destinationAddress: appService,
			port: Number(appPort),
			isLocked: true
		}
	})
	console.log("Configuration saved to database.");
	return;
};

