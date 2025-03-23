import type { HandlerConfig, MainConfig, RouteConfig } from "./template-types";

export const getCaddyConfigTemplate = (configuredRoutes: RouteConfig[]) => {
	const caddyConfig: MainConfig = {
		admin: {
			listen: "0.0.0.0:2019",
		},
		apps: {
			http: {
				servers: {
					main: {
						listen: [":80", ":443"],
						automatic_https: {
							disable: false,
						},
						routes: configuredRoutes,
					},
				},
			},
		},
	};
	return caddyConfig;
};

export const getRouteTemplate = (
	incomingAddress: string,
	targetAddress: string,
	upstreamPort = 443,
	disableHttps = false,
): RouteConfig => {
	const handler = getHandlerTemplate(targetAddress, upstreamPort, disableHttps);
	const routeConfig: RouteConfig = {
		match: [
			{
				host: [incomingAddress],
			},
		],
		handle: [handler],
	};

	return routeConfig;
};

export const getHandlerTemplate = (
	targetAddress: string,
	upstreamPort = 443,
	disableHttps = false,
): HandlerConfig => {
	const handlerConfig: HandlerConfig = {
		handler: "reverse_proxy",
		upstreams: [{ dial: `${targetAddress}:${upstreamPort}` }],
		headers: {
			request: {
				set: {
					Host: ["{http.reverse_proxy.upstream.hostport}"],
					"X-Origin-Host": ["{http.reverse_proxy.upstream.host}"],
					"X-Origin-IP": ["{http.reverse-proxy.upstream.address}"],
				},
			},
		},
		transport: {
			protocol: "http",
			tls: {},
		},
	};

	if (disableHttps) {
		delete handlerConfig?.transport?.tls;
	}

	return handlerConfig;
};
