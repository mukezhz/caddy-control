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
	handle: RouteHandlerConfig[];
};

export type RouteHandlerConfig = {
	handler: "subroute";
	routes: [{ handle: HandlerConfig[] }]
}

export type HandlerConfig = {
	handler: "reverse_proxy" | "static_response" | "authentication";
	providers?: {
		http_basic: {
			accounts: [
				{
					password: string;
					username: string;
				}
			],
			hash: {
				algorithm: "bcrypt"
			},
			hash_cache: {}
		},
	},
	upstreams?: { dial: string }[];
	headers?: {
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		tls?: Record<string, any>;
	};
};
