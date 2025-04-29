export type MainConfig = {
	admin: {
		listen: string;
	};
	apps: {
		http: {
			servers: {
				main: {
					listen: [":80", ":443"];
					automatic_https: {
						disable: boolean;
					};
					routes: RouteConfig[];
				};
			};
		};
	};
};

export type RouteConfig = {
	match: { host: string[] }[];
	handle: HandlerConfig[] | RouteHandlerConfig[];
};

export type RouteHandlerConfig = {
	handler: "subroute";
	routes: [{ handle: HandlerConfig[] }]
}

export type HandlerConfig = {
	handler: "reverse_proxy" | "static_response";
	upstreams?: { dial: string }[];
	headers: {
		request?: {
			set: {
				Host: string[];
				"X-Origin-Host": string[];
				"X-Origin-IP": string[];
			};
		};
		Location?: string[];
	};
	status_code?: number
	transport?: {
		protocol: string;
		tls?: Record<string, any>;
		versions?: TransportVersion[];
	};
};

export type TransportVersion = "h1" | "h2" | "h2c" | "h3"
