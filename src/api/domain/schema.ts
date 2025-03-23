import { z } from "zod";

export const addDomainSchema = z.object({
	incomingAddress: z.string(),
	destinationAddress: z.string(),
});

export const deleteDomainSchema = z.object({
	incomingAddress: z.string(),
});
