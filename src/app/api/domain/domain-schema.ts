import { z } from "zod";

// Updated regex to accept localhost and other local development domains
const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{1,}$/;

const domainOrIpOrDockerRegex =
  /^(?:[a-zA-Z0-9.-]+\.[a-zA-Z0-9]{1,}|\b\d{1,3}(\.\d{1,3}){3}\b|\[?[a-fA-F0-9:]+\]?|[a-zA-Z0-9_-]+)$/;

export const addDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .refine((value) => domainRegex.test(value), {
      message:
        "Invalid domain format (must be a plain domain, e.g., example.com)",
    }),
  enableRedirection: z.boolean().default(false),
  redirectTo: z.string().optional(),
  destinationAddress: z
    .string(),
  port: z.string(),
  enableHttps: z.boolean().default(true),
}).superRefine((data, ctx) => {
  const issues = [];
  
  if (data.enableRedirection && data.redirectTo) {
    if (!domainRegex.test(data.redirectTo)) {
      ctx.addIssue({
        path: ["redirectTo"],
        message: "Invalid redirect domain format",
        code: z.ZodIssueCode.custom,
      });
      issues.push("redirectTo");
    }
  }
  
  if (!data.enableRedirection) {
    const portNumber = parseInt(data.port, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      ctx.addIssue({
        path: ["port"], 
        message: "Invalid port number",
        code: z.ZodIssueCode.custom,
      });
      issues.push("port");
    }

    if (!domainOrIpOrDockerRegex.test(data.destinationAddress)) {
      ctx.addIssue({
        path: ["destinationAddress"],
        message: "Invalid destination address format",
        code: z.ZodIssueCode.custom,
      });
      issues.push("destinationAddress");
    }
  }
  
  return issues.length === 0;
});

export type AddDomainValues = z.infer<typeof addDomainSchema>

export const deleteDomainSchema = z.object({
  incomingAddress: z
    .string()
    .min(1, "Incoming address is required")
    .refine(
      (value) => {
        return domainOrIpOrDockerRegex.test(value);
      },
      { message: "Invalid domain format" }
    ),
});
export type DeleteDomainValues = z.infer<typeof deleteDomainSchema>
