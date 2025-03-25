export type DomainCheckResults = {
	dnsCheck: {
		result: boolean;
		description: string;
	};
	proxyReachability: {
		result: boolean;
		description: string;
	};
};
