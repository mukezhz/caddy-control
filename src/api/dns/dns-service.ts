import dns from "dns";
import http from "http";
import appConfig from "../../shared/appConfig";
import type { DomainCheckResults } from "./dns-types";

/**
 * Check if the domain resolves to the proxy (DNS check).
 */
async function checkDNS(domain: string): Promise<boolean> {
	return new Promise((resolve) => {
		dns.resolve4(domain, (err, addresses) => {
			if (err) return resolve(false);
			resolve(addresses.includes(appConfig.CADDY_SERVER_IP));
		});
	});
}

/**
 * Check if the request reaches the proxy (Proxy Reachability check).
 */
async function checkProxyReachability(domain: string): Promise<boolean> {
	return new Promise((resolve) => {
		const options = {
			host: appConfig.CADDY_SERVER_IP,
			port: 80,
			method: "HEAD",
			headers: { Host: domain },
		};

		const req = http.request(options, (res) => {
			resolve(res.statusCode === 200 || res.statusCode === 308);
		});

		req.on("error", () => resolve(false));
		req.end();
	});
}

/**
 * Run all checks for a domain.
 */
export async function checkDomain(domain: string): Promise<DomainCheckResults> {
	const [dnsCheck, proxyReachability] = await Promise.all([
		checkDNS(domain),
		checkProxyReachability(domain),
	]);

	return {
		dnsCheck: {
			result: dnsCheck,
			description: dnsCheck
				? "Domain correctly resolves to proxy IP."
				: "Domain does not resolve to proxy IP.",
		},
		proxyReachability: {
			result: proxyReachability,
			description: proxyReachability
				? "Requests successfully reach the proxy."
				: "Requests do not reach the proxy.",
		},
	};
}
