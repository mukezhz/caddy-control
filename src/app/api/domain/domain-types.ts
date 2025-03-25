import { DomainCheckResults } from "../_services/dns/dns-types";

export type DomainWithCheckResults = {
	id: string;
	incomingAddress: string;
	destinationAddress: string;
	port: number;
	createdAt: Date;
	checkResults: DomainCheckResults;
};
