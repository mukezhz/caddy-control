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
	handle: HandlerConfig[];
};

export type HandlerConfig = {
	handler: "reverse_proxy";
	upstreams: { dial: string }[];
	headers: {
		request: {
			set: {
				Host: string[];
				"X-Origin-Host": string[];
				"X-Origin-IP": string[];
			};
		};
	};
	transport: {
		protocol: string;
		// tls is optional
		// biome-ignore lint/suspicious/noExplicitAny: not defined
		tls?: Record<string, any>;
	};
};
