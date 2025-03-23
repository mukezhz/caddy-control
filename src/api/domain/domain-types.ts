import type { DomainCheckResults } from "../dns/dns-types";

export type DomainWithCheckResults = {
	id: number;
	incomingAddress: string;
	destinationAddress: string;
	createdAt: Date;
	checkResults: DomainCheckResults;
};
