import dns from "node:dns";
import http from "node:http";
import type { DomainCheckResults } from "./dns-types";

const caddyServerIPAddress = process.env.CADDY_SERVER_IP;

/**
 * Check if the domain resolves to the proxy (DNS check).
 */
async function checkDNS(domain: string): Promise<boolean> {
	return new Promise((resolve) => {
		dns.resolve4(domain, (err, addresses) => {
			if (err) return resolve(false);
			resolve(addresses.includes(caddyServerIPAddress));
		});
	});
}

/**
 * Check if the request reaches the proxy (Proxy Reachability check).
 */
async function checkProxyReachability(domain: string): Promise<boolean> {
	return new Promise((resolve) => {
		const options = {
			host: caddyServerIPAddress,
			port: 80,
			method: "HEAD",
			headers: { Host: domain },
			timeout: 5000
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
