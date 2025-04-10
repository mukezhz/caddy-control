export type DomainCheckResults = {
	dnsCheck: {
		result: boolean;
		description: string;
	};
	proxyReachability: {
		result: boolean;
		description: string;
	};
	healthCheck: {
		result: boolean;
		description: string;
		lastChecked: string;
	};
};
