import { loadCaddyConfig } from "./api/caddy/caddy-service";
import {
	getCaddyConfigTemplate,
	getRouteTemplate,
} from "./api/caddy/caddy-templates";
import type { MainConfig } from "./api/caddy/template-types";
import prismaClient from "./db";
import appConfig from "./shared/appConfig";

const constructInitialCaddyConfiguration = () => {
	const frontendRoute = getRouteTemplate(appConfig.FE_HOST, "fe");
	const backendRoute = getRouteTemplate(appConfig.API_HOST, "api");
	const caddyConfig = getCaddyConfigTemplate([frontendRoute, backendRoute]);
	return caddyConfig;
};

export const initializeCaddyConfiguration = async () => {
	const existingConfig = await prismaClient.caddyConfiguration.findFirst({
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
	await prismaClient.caddyConfiguration.create({
		data: {
			config: JSON.parse(JSON.stringify(initialCaddyConfig)),
		},
	});
	console.log("Configuration saved to database.");
	return;
};
