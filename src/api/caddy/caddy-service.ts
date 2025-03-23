import axios from "axios";
import appConfig from "../../shared/appConfig";
import type { MainConfig } from "./template-types";

export const getCaddyConfig = async (timeout = 0): Promise<MainConfig> => {
	const caddyConfig = await axios.get(`${appConfig.CADDY_ADMIN_URL}/config`, {
		timeout,
	});
	return caddyConfig.data;
};

export const loadCaddyConfig = async (
	payload: MainConfig,
): Promise<MainConfig> => {
	const caddyConfig = await axios.post(`${appConfig.CADDY_ADMIN_URL}/load`, payload);
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
