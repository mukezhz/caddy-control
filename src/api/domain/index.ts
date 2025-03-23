import express from "express";
import prismaClient from "../../db";
import { validateData } from "../../middlewares";
import appConfig from "../../shared/appConfig";
import {
	getCaddyConfig,
	loadCaddyConfig,
	validateIncomingDomain,
} from "../caddy/caddy-service";
import { getRouteTemplate } from "../caddy/caddy-templates";
import { checkDomain } from "../dns/dns-service";
import type { DomainWithCheckResults } from "./domain-types";
import { addDomainSchema, deleteDomainSchema } from "./schema";

const router = express.Router();

router.post("/add", validateData(addDomainSchema), async (req, res, next) => {
	try {
		const reqPayload = addDomainSchema.parse(req.body);
		// run validations
		const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
			reqPayload.incomingAddress,
		);

		if (hasExistingRoute) {
			throw new Error("Domain already registered.");
		}

		const routeConfig = getRouteTemplate(
			reqPayload.incomingAddress,
			reqPayload.destinationAddress,
		);
		const newConfigPayload = { ...currentConfig };
		newConfigPayload.apps.http.servers.main.routes.push(routeConfig);

		await loadCaddyConfig(newConfigPayload);
		await prismaClient.caddyConfiguration.create({
			data: {
				config: JSON.parse(JSON.stringify(newConfigPayload)),
			},
		});

		await prismaClient.domains.create({
			data: {
				incomingAddress: reqPayload.incomingAddress,
				destinationAddress: reqPayload.destinationAddress,
			},
		});
		return res.json({ message: "Domain added!" });
	} catch (err) {
		next(err);
	}
});

router.get("/config", async (_, res, next) => {
	try {
		const caddyConfig = await getCaddyConfig();
		return res.json(caddyConfig);
	} catch (err) {
		next(err);
	}
});

router.get("/registered", async (_, res, next) => {
	try {
		const registeredDomains = await prismaClient.domains.findMany({});
		const domainsWithCheckResults: DomainWithCheckResults[] = [];

		for (const domain of registeredDomains) {
			const domainCheckResults = await checkDomain(domain.incomingAddress);
			domainsWithCheckResults.push({
				...domain,
				checkResults: domainCheckResults,
			});
		}
		return res.json({ data: domainsWithCheckResults });
	} catch (err) {
		next(err);
	}
});

router.delete("/", validateData(deleteDomainSchema), async (req, res, next) => {
	try {
		const reqPayload = deleteDomainSchema.parse(req.body);

		if (
			reqPayload.incomingAddress === appConfig.API_HOST
		) {
			throw new Error("Unauthorized domains.");
		}
		const { currentConfig, hasExistingRoute } = await validateIncomingDomain(
			reqPayload.incomingAddress,
		);
		if (!hasExistingRoute) {
			throw new Error("Domain not registered.");
		}
		const newConfigPayload = { ...currentConfig };
		const filteredRoutes =
			newConfigPayload.apps.http.servers.main.routes.filter((route) =>
				route.match.some((ma) => !ma.host.includes(reqPayload.incomingAddress)),
			);
		newConfigPayload.apps.http.servers.main.routes = filteredRoutes;

		await loadCaddyConfig(newConfigPayload);
		await prismaClient.caddyConfiguration.create({
			data: {
				config: JSON.parse(JSON.stringify(newConfigPayload)),
			},
		});

		await prismaClient.domains.delete({
			where: {
				incomingAddress: reqPayload.incomingAddress,
			},
		});
		return res.json({ message: "Domain deleted!" });
	} catch (err) {
		next(err);
	}
});

export default router;
