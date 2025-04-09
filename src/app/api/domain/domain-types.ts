import { DomainCheckResults } from "../_services/dns/dns-types";

export type DomainWithCheckResults = {
	id: string;
	incomingAddress: string;
	destinationAddress: string;
	port: number;
	createdAt: Date;
	isLocked: boolean;
	enableHttps: boolean;
	redirectUrl?: string;
	checkResults: DomainCheckResults;
};
